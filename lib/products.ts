import { Product as PrismaProduct, Category } from "@prisma/client";

export type Product = PrismaProduct & {
  category: Category;
};
