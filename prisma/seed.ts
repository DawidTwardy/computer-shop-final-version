// computer-shop-lab10-dawidtwardy/prisma/seed.ts

import "dotenv/config"; // <--- KLUCZOWA ZMIANA
import { PrismaClient, OrderStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
// Wczytanie danych (ścieżka względna wewnątrz podprojektu)
const productsData = require('../data/products.json');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const productTypes = ['procesor', 'karta graficzna', 'pamięć ram', 'dysk'];

async function main() {
  console.log('Rozpoczynam pełny seeding (podprojekt)...');

  // 1. Czyszczenie bazy danych
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  
  // Czyszczenie tabel Auth.js (jeśli istnieją)
  try {
    await (prisma as any).session.deleteMany();
    await (prisma as any).account.deleteMany();
    await (prisma as any).verificationToken.deleteMany();
  } catch (e) {
    console.log("Tabele Auth.js jeszcze nie istnieją lub błąd czyszczenia, pomijam.");
  }

  await prisma.user.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  console.log('Wyczyszczono stare dane.');

  // 2. Tworzenie kategorii
  await prisma.category.createMany({
    data: productTypes.map(type => ({ name: type })),
    skipDuplicates: true,
  });
  const categories = await prisma.category.findMany();
  const categoryMap = new Map(categories.map(c => [c.name, c.id]));
  
  // 3. Tworzenie produktów
  const productsToSeed = productsData.map((p: any) => ({
    ...p,
    price: parseFloat(p.price.toFixed(2)), 
    categoryId: categoryMap.get(p.type)!, 
    type: p.type, 
  }));
  
  const productCreationData = productsToSeed.map(({ id, date, ...rest }: any) => ({ 
    ...rest, 
  })); 
  
  await prisma.product.createMany({
    data: productCreationData,
    skipDuplicates: true,
  });
  console.log(`Utworzono ${productsToSeed.length} produktów.`);

  // 4. Pobranie produktów
  const allProducts = await prisma.product.findMany({ orderBy: { id: 'asc' } });
  const getProductByCode = (code: string) => allProducts.find(p => p.code === code)!;
  
  // 5. Tworzenie użytkownika testowego
  const user = await prisma.user.create({
    data: {
      email: 'user@pk.edu.pl',
      name: 'Jan Kowalski (Testowy)',
    },
  });
  console.log(`Utworzono użytkownika testowego (ID: ${user.id}).`);

  // 6. Przykładowy Koszyk
  const cart = await prisma.cart.create({
    data: {
      userId: user.id,
      items: {
        create: [
          { productId: getProductByCode('GPU-NV4070SUPR').id, quantity: 1, createdAt: new Date(Date.now() - 3600000) },
          { productId: getProductByCode('RAM-D5600032GC').id, quantity: 2, createdAt: new Date() },
        ],
      },
    },
  });
  console.log(`Utworzono koszyk (ID: ${cart.id}).`);
}

main()
  .then(() => console.log('Seeding zakończony pomyślnie!'))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });