import { Prisma, PrismaClient } from '@prisma/client';
import { secrets } from './secrets';

let prisma: PrismaClient | null = null;

declare global {
  var __prisma: PrismaClient | undefined;
}

export type DBContext = {
  db: PrismaClient;
};

export function createDBContext(client?: PrismaClient): DBContext {
  return {
    db: client ?? getDefaultPrisma(),
  };
}

export async function getPrisma(): Promise<PrismaClient> {
  if (process.env.NODE_ENV === 'development' && global.__prisma) {
    return global.__prisma;
  }

  if (prisma) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return prisma;
    } catch {
      await disconnectPrisma();
    }
  }

  const databaseUrl = await secrets.getDatabaseUrl();

  prisma = new PrismaClient({
    datasources: {
      db: { url: databaseUrl },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: process.env.NODE_ENV === 'development' ? 'pretty' : 'minimal',
  });

  if (process.env.NODE_ENV === 'development') {
    global.__prisma = prisma;
  }

  await prisma.$connect();
  return prisma;
}

export function getDefaultPrisma(): PrismaClient {
  if (!prisma) {
    throw new Error('Prisma client not initialized. Call getPrisma() first.');
  }
  return prisma;
}

export async function withTransaction<T>(
  callback: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  const client = await getPrisma();
  return client.$transaction(callback);
}

export async function disconnectPrisma(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }

  if (process.env.NODE_ENV === 'development' && global.__prisma) {
    await global.__prisma.$disconnect();
    global.__prisma = undefined;
  }
}
