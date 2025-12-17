"use server"

import { prisma } from "../db"
import { revalidatePath } from "next/cache"
import { OrderStatus } from "@prisma/client"
import { auth } from "../auth" //

// Akcja: Dodanie do koszyka (addToCart)
export async function addToCart(productId: number, quantity: number = 1) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
     return null; // Lub rzuć błąd, jeśli wolisz
  }

  const pId = Number(productId);
  const qty = Number(quantity);
  
  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } });
  }

  const cartItem = await prisma.cartItem.upsert({
    where: {
      cartId_productId: { cartId: cart.id, productId: pId },
    },
    update: { quantity: { increment: qty } },
    create: { cartId: cart.id, productId: pId, quantity: qty },
  });
  
  revalidatePath("/basket")
  return cartItem
}


export async function getCartWithItems(userId: string) {
  return await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              category: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })
}

export async function getCartTotal(userId: string) {
  const cart = await getCartWithItems(userId)
  if (!cart) return 0
  
  return cart.items.reduce((sum, item) => {
    return sum + (Number(item.product.price) * item.quantity)
  }, 0)
}

export async function getAllUsersWithCarts() {
  return await prisma.user.findMany({
    include: {
      cart: {
        include: {
          _count: {
            select: { items: true }
          }
        }
      }
    }
  })
}

export async function transferCart(fromUserId: string, toUserId: string) {
  if (fromUserId === toUserId) {
    throw new Error("Nie można przenieść koszyka do tego samego użytkownika")
  }

  const sourceCart = await prisma.cart.findUnique({
    where: { userId: fromUserId },
    include: { items: true }
  })

  if (!sourceCart || sourceCart.items.length === 0) {
    return { success: false, message: "Kosz źródłowy jest pusty" }
  }

  let targetCart = await prisma.cart.findUnique({
    where: { userId: toUserId }
  })

  if (!targetCart) {
    targetCart = await prisma.cart.create({
      data: { userId: toUserId }
    })
  }

  for (const item of sourceCart.items) {
    await prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: targetCart.id,
          productId: item.productId
        }
      },
      update: {
        quantity: { increment: item.quantity }
      },
      create: {
        cartId: targetCart.id,
        productId: item.productId,
        quantity: item.quantity
      }
    })
  }

  await prisma.cartItem.deleteMany({
    where: { cartId: sourceCart.id }
  })

  revalidatePath("/basket")
  return { success: true, message: "Przeniesiono pomyślnie" }
}

// Akcja: Czyszczenie koszyka (clearCart)
export async function clearCart() {
  const session = await auth();
  const userId = session?.user?.id;
  
  if (!userId) return;

  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    revalidatePath("/basket");
  }
}

// Akcja: Usuwanie elementu z koszyka (removeItemFromCart)
export async function removeItemFromCart(productId: number) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return;

  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (cart) {
    await prisma.cartItem.delete({
      where: {
        cartId_productId: { cartId: cart.id, productId },
      },
    });
    revalidatePath("/basket");
  }
}

// Akcja: Składanie zamówienia (placeOrder) - ZINTEGROWANA WERSJA
export async function placeOrder() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
      return { success: false, message: "Użytkownik niezalogowany" };
  }

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });

  if (!cart) {
    return { success: false, message: "Koszyk nie znaleziony" };
  }
  if (cart.items.length === 0) {
    return { success: false, message: "Koszyk jest pusty" };
  }
  
  try {
    const DISCOUNT_RATE = 0.9;
    
    const totalAmount = cart.items.reduce((sum, item) =>
      sum + (item.product.price * DISCOUNT_RATE) * item.quantity, 0
    );

    await prisma.order.create({
      data: {
        userId,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        status: OrderStatus.PENDING, 
        items: {
          create: cart.items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            priceAtOrder: parseFloat((item.product.price * DISCOUNT_RATE).toFixed(2)),
            productName: item.product.name,
            productCode: item.product.code,
          })),
        },
      },
    });

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    revalidatePath("/basket");
    revalidatePath("/order-history");
    
    return { success: true, message: "Zamówienie złożone pomyślnie!" };
  } catch (error) {
    console.error("Order creation failed:", error);
    return { success: false, message: "Wystąpił błąd podczas składania zamówienia." };
  }
}
