import { query, queryOne } from "../client";
import type { Product } from "@pharmapersonal/types";

export async function getProducts(pharmacy_id: string): Promise<Product[]> {
  return query<Product>(
    `SELECT * FROM products WHERE pharmacy_id = $1 AND active = true ORDER BY name`,
    [pharmacy_id]
  );
}

export async function createProduct(
  data: Omit<Product, "id" | "active"> & { pharmacy_id: string }
): Promise<Product> {
  const row = await queryOne<Product>(
    `INSERT INTO products (pharmacy_id, name, category, tags, price, ean, description)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [
      data.pharmacy_id,
      data.name,
      data.category,
      data.tags,
      data.price,
      data.ean ?? null,
      (data as any).description ?? null,
    ]
  );
  return row!;
}

export async function updateProduct(
  id: string,
  pharmacy_id: string,
  data: Partial<Product>
): Promise<Product | null> {
  return queryOne<Product>(
    `UPDATE products
     SET name = COALESCE($3, name),
         category = COALESCE($4, category),
         tags = COALESCE($5, tags),
         price = COALESCE($6, price),
         active = COALESCE($7, active)
     WHERE id = $1 AND pharmacy_id = $2
     RETURNING *`,
    [id, pharmacy_id, data.name, data.category, data.tags, data.price, data.active]
  );
}

export async function deleteProduct(
  id: string,
  pharmacy_id: string
): Promise<void> {
  await queryOne(
    `UPDATE products SET active = false WHERE id = $1 AND pharmacy_id = $2`,
    [id, pharmacy_id]
  );
}
