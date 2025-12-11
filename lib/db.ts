// lib/db.ts
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Ten plik jest używany do tworzenia pojedynczej instancji Prisma z adapterem PG,
// która jest następnie używana przez inne pliki lib.

const connectionString = process.env.DATABASE_URL

// Jeśli brakuje connectionString, może spowodować to błąd, ale jest to 
// konieczne, gdy używamy adaptera PG
if (!connectionString) {
  throw new Error("Brak DATABASE_URL w zmiennych środowiskowych")
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Upewnij się, że instancja prisma jest eksportowana jako 'prisma'
export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
