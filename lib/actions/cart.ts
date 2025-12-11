// lib/actions/cart.ts
"use server"

import { prisma } from "../db" // Używaj tego samego pliku co auth.ts
import { revalidatePath } from "next/cache"

// Wymaga importu 'prisma' z lib/db
import { getCartWithItems } from "../api" 

// POPRAWKA: Przenieś addToCart do api.ts lub dodaj go tutaj
// Ten błąd sugeruje, że brakuje tej funkcji, 
// a była ona w pierwotnym pliku lib/actions/cart.ts (nieudostępnionym)
// Odtwarzam funkcję addToCart:

export async function addToCart(productId: number, userId: string, quantity: number = 1) {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    throw new Error("Koszyk nie istnieje")
  }

  const pId = Number(productId);
  const qty = Number(quantity);

  const cartItem = await prisma.cartItem.upsert({
    where: {
      cartId_productId: { cartId: cart.id, productId: pId },
    },
    update: { quantity: { increment: qty } },
    create: { cartId: cart.id, productId: pId, quantity: qty },
    include: { product: true },
  });
  
  revalidatePath("/basket")
  return cartItem
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
  return { success: true }
}

// Odtwarzam brakujące akcje:
export async function clearCart(userId: string) {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    revalidatePath("/basket");
  }
}

export async function removeItemFromCart(userId: string, productId: number) {
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
// Odtwarzam funkcję placeOrder (zakładając uproszczoną logikę z pliku src/index.ts)
// Zależy od pliku lib/orders.ts, którego nie ma, ale spróbuję użyć logiki z pliku src/index.ts
// UWAGA: Ta funkcja jest niekompletna bez pełnej logiki tworzenia zamówienia.
// Tworzę ją na podstawie wiedzy o strukturze projektu:

import { OrderStatus } from "@prisma/client";

export async function placeOrder(userId: string, cartId: number) {
  const DISCOUNT_RATE = 0.9;
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error("Koszyk jest pusty");
  }

  const totalAmount = cart.items.reduce((sum, item) =>
    sum + (item.product.price * DISCOUNT_RATE) * item.quantity, 0
  );

  const order = await prisma.order.create({
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

  await prisma.cartItem.deleteMany({ where: { cartId } });
  revalidatePath("/basket");
  revalidatePath("/order-history");
  return order;
}
