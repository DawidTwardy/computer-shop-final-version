// lib/db.ts
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("Brak DATABASE_URL w zmiennych środowiskowych")
}

// Używamy globalnego obiektu do singletona, ale z adapterem
// W trybie produkcji (Vercel) Adapter musi zostać załadowany
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Jeśli to nie produkcja, używamy istniejącego globalnego, aby uniknąć ponownego tworzenia połączenia.
// W produkcji tworzymy nową instancję.
export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
