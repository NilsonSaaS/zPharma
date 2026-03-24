import type { HealthProfile, Product } from "@pharmapersonal/types";
import { RECO } from "@pharmapersonal/config";
import { applyRules } from "./rules/index";
import { computeHealthScore } from "./health-score";
import { generateTemplateReason } from "./templates";
import { updateHealthScore } from "../db/queries/profiles";
import { insertRecommendations } from "../db/queries/recommendations";
import { getProducts } from "../db/queries/products";

export async function runRecommendationEngine(
  userId: string,
  pharmacyId: string,
  profile: HealthProfile
): Promise<{ health_score: number; recommendations: Array<{ product_id: string; score: number; reason: string; source: string }> }> {
  // 1. Calcul du score santé
  const { total: healthScore } = computeHealthScore(profile);
  await updateHealthScore(userId, healthScore);

  // 2. Catalogue de la pharmacie
  const products = await getProducts(pharmacyId);
  if (products.length === 0) {
    return { health_score: healthScore, recommendations: [] };
  }

  // 3. Règles déterministes → top N candidats
  const ruleBased = applyRules(profile, products, RECO.MIN_RULE_SCORE);
  const candidates = ruleBased.slice(0, RECO.FINAL_TOP_N);

  // 4. Génération des raisons par templates (sans API IA)
  const finalRecs = candidates.map((c) => {
    const product = products.find((p) => p.id === c.product_id) as Product;
    return {
      user_id: userId,
      product_id: c.product_id,
      score: c.score,
      reason: generateTemplateReason(product, profile),
      source: "rule",
    };
  });

  // 5. Persist en BDD
  await insertRecommendations(finalRecs);

  return { health_score: healthScore, recommendations: finalRecs };
}
