"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

// --- POBIERANIE DANYCH ---

export async function getCartWithItems(userId: string) {
  return await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: { include: { category: true } }
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
          _count: { select: { items: true } }
        }
      }
    }
  })
}

// --- MODYFIKACJE KOSZYKA ---

export async function addToCart(productId: number, quantity: number = 1) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, message: "Musisz być zalogowany" }

  const userId = session.user.id
  let cart = await prisma.cart.findUnique({ where: { userId } })

  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } })
  }

  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    update: { quantity: { increment: quantity } },
    create: { cartId: cart.id, productId, quantity }
  })

  revalidatePath("/basket")
  return { success: true, message: "Dodano do koszyka" }
}

export async function removeItemFromCart(productId: number) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, message: "Brak autoryzacji" }

  const userId = session.user.id
  const cart = await prisma.cart.findUnique({ where: { userId } })
  if (!cart) return { success: false, message: "Koszyk nie istnieje" }

  await prisma.cartItem.delete({
    where: { cartId_productId: { cartId: cart.id, productId } }
  })

  revalidatePath("/basket")
  return { success: true, message: "Usunięto produkt" }
}

export async function clearCart(userId: string) {
  const cart = await prisma.cart.findUnique({ where: { userId } })
  if (!cart) return { success: false, message: "Koszyk nie istnieje" }

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id }
  })

  revalidatePath("/basket")
  return { success: true, message: "Koszyk wyczyszczony" }
}

export async function placeOrder(userId: string) {
  const cart = await getCartWithItems(userId)
  
  if (!cart || cart.items.length === 0) {
    return { success: false, message: "Koszyk jest pusty" }
  }

  const totalAmount = cart.items.reduce((sum, item) => 
    sum + (item.product.price * item.quantity), 0
  )

  // Transakcja: Utwórz zamówienie -> Wyczyść koszyk -> Zaktualizuj stany magazynowe
  await prisma.$transaction(async (tx) => {
    // 1. Zamówienie
    await tx.order.create({
      data: {
        userId,
        totalAmount,
        status: "PENDING",
        items: {
          create: cart.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtOrder: item.product.price,
            productName: item.product.name,
            productCode: item.product.code
          }))
        }
      }
    })

    // 2. Czyszczenie koszyka
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id }
    })
    
    // 3. Aktualizacja stanów magazynowych (opcjonalne, ale zalecane)
    for (const item of cart.items) {
        await tx.product.update({
            where: { id: item.productId },
            data: { amount: { decrement: item.quantity } }
        })
    }
  })

  revalidatePath("/basket")
  return { success: true, message: "Zamówienie złożone pomyślnie!" }
}

export async function transferCart(fromUserId: string, toUserId: string) {
  if (fromUserId === toUserId) throw new Error("Nie można przenieść do tego samego użytkownika")

  const sourceCart = await prisma.cart.findUnique({
    where: { userId: fromUserId },
    include: { items: true }
  })

  if (!sourceCart || sourceCart.items.length === 0) {
    return { success: false, message: "Kosz źródłowy jest pusty" }
  }

  let targetCart = await prisma.cart.findUnique({ where: { userId: toUserId } })
  if (!targetCart) {
    targetCart = await prisma.cart.create({ data: { userId: toUserId } })
  }

  for (const item of sourceCart.items) {
    await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: targetCart.id, productId: item.productId } },
      update: { quantity: { increment: item.quantity } },
      create: { cartId: targetCart.id, productId: item.productId, quantity: item.quantity }
    })
  }

  await prisma.cartItem.deleteMany({ where: { cartId: sourceCart.id } })

  revalidatePath("/basket")
  return { success: true }
}