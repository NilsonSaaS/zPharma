import type { HealthProfile } from "@pharmapersonal/types";
import { HEALTH_SCORE } from "@pharmapersonal/config";

interface ScoreBreakdown {
  total: number;
  details: Array<{ label: string; delta: number }>;
}

export function computeHealthScore(
  profile: HealthProfile
): ScoreBreakdown {
  let score = 100;
  const details: Array<{ label: string; delta: number }> = [];

  const add = (label: string, delta: number) => {
    score += delta;
    details.push({ label, delta });
  };

  // ─── Pénalités ─────────────────────────────────────────
  if (profile.smoker)
    add("Tabagisme", -20);

  if (profile.sleep_hours < 6)
    add("Sommeil très insuffisant (< 6h)", -15);
  else if (profile.sleep_hours < 7)
    add("Sommeil insuffisant (< 7h)", -8);

  if (profile.activity_level === "sedentary")
    add("Mode de vie sédentaire", -10);

  if (profile.conditions.includes("diabetes"))
    add("Diabète", -10);

  if (profile.conditions.includes("hypertension"))
    add("Hypertension", -8);

  if (profile.conditions.includes("cholesterol"))
    add("Cholestérol élevé", -6);

  // ─── Bonus ─────────────────────────────────────────────
  if (profile.activity_level === "active")
    add("Activité physique régulière", +8);

  if (profile.activity_level === "moderate")
    add("Activité physique modérée", +4);

  if (profile.diet === "vegan" || profile.diet === "vegetarian")
    add("Alimentation équilibrée", +4);

  if (profile.sleep_hours >= 8)
    add("Bon sommeil (≥ 8h)", +6);
  else if (profile.sleep_hours >= 7)
    add("Sommeil correct (≥ 7h)", +3);

  const clamped = Math.max(HEALTH_SCORE.MIN, Math.min(HEALTH_SCORE.MAX, score));

  return { total: clamped, details };
}

export function getScoreLabel(score: number): {
  label: string;
  color: string;
} {
  if (score >= 75) return { label: "Excellent", color: "green" };
  if (score >= 55) return { label: "Bon", color: "blue" };
  if (score >= 40) return { label: "Moyen", color: "orange" };
  return { label: "A améliorer", color: "red" };
}
