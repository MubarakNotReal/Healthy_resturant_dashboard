import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString =
  process.env.DATABASE_URL || 'postgresql://postgres:1234@localhost:5432/nourish_hub';

// Use ssl only for non-local hosts to match typical cloud Postgres defaults
const sslOption = connectionString.includes('localhost') || connectionString.includes('127.0.0.1')
  ? undefined
  : { rejectUnauthorized: false } as const;

export const client = postgres(connectionString, {
  ssl: sslOption,
  prepare: false,
});

export const db = drizzle(client, { schema });