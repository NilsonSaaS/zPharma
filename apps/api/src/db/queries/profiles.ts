import { queryOne } from "../client";
import type { HealthProfile } from "@pharmapersonal/types";

export async function getProfile(user_id: string): Promise<HealthProfile | null> {
  return queryOne<HealthProfile>(
    `SELECT * FROM health_profiles WHERE user_id = $1`,
    [user_id]
  );
}

export async function upsertProfile(
  user_id: string,
  data: Omit<HealthProfile, "id" | "user_id" | "health_score" | "updated_at">
): Promise<HealthProfile> {
  const row = await queryOne<HealthProfile>(
    `INSERT INTO health_profiles
       (user_id, age, sex, weight_kg, height_cm, goals, conditions,
        diet, activity_level, sleep_hours, smoker)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     ON CONFLICT (user_id) DO UPDATE SET
       age            = EXCLUDED.age,
       sex            = EXCLUDED.sex,
       weight_kg      = EXCLUDED.weight_kg,
       height_cm      = EXCLUDED.height_cm,
       goals          = EXCLUDED.goals,
       conditions     = EXCLUDED.conditions,
       diet           = EXCLUDED.diet,
       activity_level = EXCLUDED.activity_level,
       sleep_hours    = EXCLUDED.sleep_hours,
       smoker         = EXCLUDED.smoker,
       updated_at     = now()
     RETURNING *`,
    [
      user_id,
      data.age,
      data.sex,
      data.weight_kg,
      data.height_cm,
      data.goals,
      data.conditions,
      data.diet,
      data.activity_level,
      data.sleep_hours,
      data.smoker,
    ]
  );
  return row!;
}

export async function updateHealthScore(
  user_id: string,
  score: number
): Promise<void> {
  await queryOne(
    `UPDATE health_profiles SET health_score = $1, updated_at = now()
     WHERE user_id = $2`,
    [score, user_id]
  );
}
