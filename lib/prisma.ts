import { PrismaClient } from '@prisma/client';
import { join } from 'path';
import { existsSync } from 'fs';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// DATABASE_URL'i kontrol et ve mutlak yol oluştur
let databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl || databaseUrl === 'file:./dev.db') {
  // Varsayılan olarak prisma/dev.db kullan
  const dbPath = join(process.cwd(), 'prisma', 'dev.db');
  databaseUrl = `file:${dbPath}`;
} else if (databaseUrl.startsWith('file:./')) {
  // Göreli yolu mutlak yola çevir
  const relativePath = databaseUrl.replace('file:', '');
  const dbPath = join(process.cwd(), relativePath);
  databaseUrl = `file:${dbPath}`;
} else if (databaseUrl.startsWith('file:')) {
  // Zaten mutlak yol gibi görünüyor, olduğu gibi kullan
  // Ama eğer ./ ile başlıyorsa düzelt
  const pathPart = databaseUrl.replace('file:', '');
  if (pathPart.startsWith('./')) {
    const dbPath = join(process.cwd(), pathPart.replace('./', ''));
    databaseUrl = `file:${dbPath}`;
  }
}

// Veritabanı dosyasının varlığını kontrol et
const dbPath = databaseUrl.replace('file:', '');
if (!existsSync(dbPath)) {
  console.warn(`⚠️  Database file not found at: ${dbPath}`);
  console.warn(`   Prisma will create it automatically on first query`);
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

