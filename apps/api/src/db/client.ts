import { Pool } from "pg";

// ─── PostgreSQL ────────────────────────────────────────────
export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

db.on("error", (err) => console.error("DB pool error:", err));

// ─── Helpers ──────────────────────────────────────────────
export async function query<T>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const res = await db.query(sql, params);
  return res.rows as T[];
}

export async function queryOne<T>(
  sql: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}
