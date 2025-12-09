import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const app = express();
const prisma = new PrismaClient({ adapter });
const PORT = process.env.PORT || 3001;
const DISCOUNT_RATE = 0.9; // NOWA STAŁA: 10% zniżki (cena końcowa to 90% oryginalnej)

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// PRODUCTS API
// ============================================

// GET all products
app.get("/api/products", async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Błąd podczas pobierania produktów" });
  }
});

// GET product by ID
app.get("/api/products/:id", async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { category: true },
    });
    if (!product) {
      res.status(404).json({ error: "Produkt nie znaleziony" });
      return;
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Błąd podczas pobierania produktu" });
  }
});

// GET products by category
app.get("/api/products/category/:categoryId", async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: { categoryId: parseInt(req.params.categoryId) },
      include: { category: true },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Błąd podczas pobierania produktów" });
  }
});

// ============================================
// CATEGORIES API
// ============================================

app.get("/api/categories", async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Błąd podczas pobierania kategorii" });
  }
});

// ============================================
// CART API
// ============================================

// GET cart for user
app.get("/api/cart/:userId", async (req: Request, res: Response) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: parseInt(req.params.userId) },
      include: {
        items: {
          include: { product: true },
        },
      },
    });
    if (!cart) {
      res.status(404).json({ error: "Koszyk nie znaleziony" });
      return;
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Błąd podczas pobierania koszyka" });
  }
});

// ADD to cart
app.post("/api/cart/:userId/items", async (req: Request, res: Response) => {
  try {
    const { productId, quantity } = req.body;
    const userId = parseInt(req.params.userId);

    let cart = await prisma.cart.findUnique({ where: { userId } });

    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    const cartItem = await prisma.cartItem.upsert({
      where: {
        cartId_productId: { cartId: cart.id, productId },
      },
      update: { quantity: (await prisma.cartItem.findUnique({ where: { cartId_productId: { cartId: cart.id, productId } } }))?.quantity || 0 + quantity },
      create: { cartId: cart.id, productId, quantity },
      include: { product: true },
    });

    res.json(cartItem);
  } catch (error) {
    res.status(500).json({ error: "Błąd podczas dodawania do koszyka" });
  }
});

// REMOVE from cart
app.delete("/api/cart/:userId/items/:productId", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const productId = parseInt(req.params.productId);

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      res.status(404).json({ error: "Koszyk nie znaleziony" });
      return;
    }

    await prisma.cartItem.delete({
      where: {
        cartId_productId: { cartId: cart.id, productId },
      },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Błąd podczas usuwania z koszyka" });
  }
});

// ============================================
// ORDERS API
// ============================================

// GET user orders
app.get("/api/orders/:userId", async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: parseInt(req.params.userId) },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Błąd podczas pobierania zamówień" });
  }
});

// CREATE order
app.post("/api/orders", async (req: Request, res: Response) => {
  try {
    const { userId, cartId } = req.body;

    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      res.status(400).json({ error: "Koszyk jest pusty" });
      return;
    }
    
    // ZMODYFIKOWANA LOGIKA: OBLICZANIE TOTAL AMOUNT Z UWZGLĘDNIENIEM ZNIŻKI
    const totalAmount = cart.items.reduce((sum, item) => 
      sum + (item.product.price * DISCOUNT_RATE) * item.quantity, 0
    );

    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        items: {
          create: cart.items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            // ZMODYFIKOWANA LOGIKA: ZAPIS CENY Z UWZGLĘDNIENIEM ZNIŻKI
            priceAtOrder: parseFloat((item.product.price * DISCOUNT_RATE).toFixed(2)),
            productName: item.product.name,
            productCode: item.product.code,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    // Clear cart
    await prisma.cartItem.deleteMany({ where: { cartId } });

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Błąd podczas tworzenia zamówienia" });
  }
});

// ============================================
// HEALTH CHECK
// ============================================

app.get("/api/health", async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "✅ OK", database: "Connected" });
  } catch (error) {
    res.status(500).json({ status: "❌ Error", database: "Disconnected" });
  }
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`🚀 Backend API running on http://localhost:${PORT}`);
  console.log(`📊 Docs: GET http://localhost:${PORT}/api/health`);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});