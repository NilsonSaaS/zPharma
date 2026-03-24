import { query, queryOne } from "../client";
import type { Recommendation } from "@pharmapersonal/types";

export async function getRecommendations(
  user_id: string,
  limit = 5
): Promise<Recommendation[]> {
  return query<Recommendation>(
    `SELECT r.*, row_to_json(p.*) as product
     FROM recommendations r
     JOIN products p ON r.product_id = p.id
     WHERE r.user_id = $1
     ORDER BY r.score DESC, r.created_at DESC
     LIMIT $2`,
    [user_id, limit]
  );
}

export async function insertRecommendations(
  recs: Array<{
    user_id: string;
    product_id: string;
    reason: string;
    score: number;
    source: string;
  }>
): Promise<void> {
  // Supprime les anciennes recos du jour avant d'insérer les nouvelles
  if (recs.length === 0) return;
  const user_id = recs[0].user_id;

  await queryOne(
    `DELETE FROM recommendations
     WHERE user_id = $1 AND created_at::date = now()::date`,
    [user_id]
  );

  for (const r of recs) {
    await queryOne(
      `INSERT INTO recommendations (user_id, product_id, reason, score, source)
       VALUES ($1, $2, $3, $4, $5)`,
      [r.user_id, r.product_id, r.reason, r.score, r.source]
    );
  }
}

export async function markAsSeen(
  rec_id: string,
  user_id: string
): Promise<void> {
  await queryOne(
    `UPDATE recommendations SET seen = true
     WHERE id = $1 AND user_id = $2`,
    [rec_id, user_id]
  );
}
