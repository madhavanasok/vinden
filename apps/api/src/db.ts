import { PGlite } from '@electric-sql/pglite';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

/*
 * The demo database is an embedded Postgres (PGlite) kept in apps/api/.data, so data and any
 * vouches or saves made in the app survive restarts. `npm run db:reset` deletes it; the next
 * start rebuilds it from the seed.
 *
 * On Vercel the file system is read-only, so the database lives in memory: each new function
 * instance starts from the seed, and changes last only while that instance stays warm.
 */
function open() {
  if (process.env.VERCEL) return new PGlite();
  const dataDir = process.env.VINDEN_DATA_DIR ?? join(here, '..', '.data', 'pg');
  mkdirSync(dataDir, { recursive: true });
  return new PGlite(dataDir);
}
export const db = open();

export async function rows<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  return (await db.query<T>(sql, params)).rows;
}

export async function one<T>(sql: string, params: unknown[] = []): Promise<T | undefined> {
  return (await rows<T>(sql, params))[0];
}
