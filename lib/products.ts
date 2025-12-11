import { Product as PrismaProduct, Category } from "@prisma/client";

export type Product = PrismaProduct & {
  category: Category;
};

// Dodajemy brakującą funkcję do generowania slugów
export function slugifyCategoryName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}
