// prisma.config.ts
import { defineConfig } from "@prisma/config";

export default defineConfig({
  // Wskazujemy gdzie leży schemat
  schema: "prisma/schema.prisma",
  // Konfiguracja bazy danych (pobiera adres z Vercel ENV)
  datasource: {
    provider: "postgresql",
    url: process.env.DATABASE_URL, 
  },
});
