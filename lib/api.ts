import { prisma } from "@/lib/prisma";

export async function getProducts() {
  return await prisma.product.findMany({
    include: { category: true },
  });
}

export async function getProductById(id: number) {
  return await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
}

export async function getCategories() {
  return await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
  });
}

export async function getProductsByCategory(categoryId: number) {
  return await prisma.product.findMany({
    where: { categoryId },
    include: { category: true },
  });
}
