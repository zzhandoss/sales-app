import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { parseEnv } from '@shared/config';
import * as schema from './schema';

const poolByConnectionString = new Map<string, Pool>();

const resolvePool = (connectionString: string): Pool => {
  const existing = poolByConnectionString.get(connectionString);
  if (existing) {
    return existing;
  }

  const created = new Pool({ connectionString });
  poolByConnectionString.set(connectionString, created);
  return created;
};

export const createDb = (connectionString: string) => {
  return drizzle(resolvePool(connectionString), { schema });
};

export type DB = ReturnType<typeof createDb>;

export const createDbFromEnv = (source: Record<string, string | undefined> = process.env): DB => {
  const env = parseEnv(source);
  return createDb(env.DATABASE_URL);
};
