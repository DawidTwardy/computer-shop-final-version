"use server";

import { prisma } from "../../lib/db";
import { revalidatePath } from "next/cache";

export async function clearCart(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (cart) {
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
    
    revalidatePath("/basket");
  }
}

export async function placeOrder(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error("Koszyk jest pusty");
  }

  const totalAmount = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const order = await prisma.order.create({
    data: {
      userId,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      items: {
        create: cart.items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          priceAtOrder: item.product.price,
          productName: item.product.name,
          productCode: item.product.code,
        })),
      },
    },
  });

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  revalidatePath("/basket");
  return order;
}