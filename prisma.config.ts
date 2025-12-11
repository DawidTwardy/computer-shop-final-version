// prisma.config.ts
import { defineConfig } from "@prisma/config";

export default defineConfig({
  // Wskazujemy gdzie leży schemat
  schema: "prisma/schema.prisma",
  // Konfiguracja bazy danych
  datasource: {
    provider: "postgresql",
    url: process.env.DATABASE_URL, // Tutaj Prisma pobierze adres z Vercel
  },
});
