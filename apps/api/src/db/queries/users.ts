import { query, queryOne } from "../client";
import type { User } from "@pharmapersonal/types";

export async function findUserByEmail(email: string): Promise<User | null> {
  return queryOne<User>(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );
}

export async function findUserById(id: string): Promise<User | null> {
  return queryOne<User>(
    `SELECT id, pharmacy_id, email, role, first_name, last_name, created_at
     FROM users WHERE id = $1`,
    [id]
  );
}

export async function createUser(payload: {
  pharmacy_id: string;
  email: string;
  password: string;
  role: string;
  first_name?: string;
  last_name?: string;
}): Promise<User> {
  const row = await queryOne<User>(
    `INSERT INTO users (pharmacy_id, email, password, role, first_name, last_name)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, pharmacy_id, email, role, first_name, last_name, created_at`,
    [
      payload.pharmacy_id,
      payload.email,
      payload.password,
      payload.role,
      payload.first_name ?? null,
      payload.last_name ?? null,
    ]
  );
  return row!;
}

export async function listPatientsByPharmacy(
  pharmacy_id: string
): Promise<User[]> {
  return query<User>(
    `SELECT u.id, u.pharmacy_id, u.email, u.role, u.first_name, u.last_name, u.created_at
     FROM users u
     WHERE u.pharmacy_id = $1 AND u.role = 'patient'
     ORDER BY u.created_at DESC`,
    [pharmacy_id]
  );
}
