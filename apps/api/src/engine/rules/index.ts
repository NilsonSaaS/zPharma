import type { HealthProfile, Product } from "@pharmapersonal/types";

interface ScoredProduct {
  product_id: string;
  score: number;
  reason: string;
  source: "rule" | "ai" | "hybrid";
}

// ─── Règles par tag produit ───────────────────────────────
// Chaque règle retourne un score entre 0 et 1
type Rule = (p: HealthProfile) => number;

const RULES: Record<string, Rule> = {
  // Magnésium
  magnesium: (p) => {
    let s = 0;
    if (p.goals.includes("stress"))          s += 0.4;
    if (p.goals.includes("sleep"))           s += 0.25;
    if (p.activity_level === "active")       s += 0.2;
    if (p.conditions.includes("hypertension")) s += 0.15;
    return Math.min(s, 1);
  },

  // Oméga-3
  omega3: (p) => {
    let s = 0;
    if (p.conditions.includes("cholesterol"))  s += 0.5;
    if (p.diet === "vegan")                    s += 0.4;
    if (p.diet === "vegetarian")               s += 0.2;
    if (p.goals.includes("heart"))             s += 0.3;
    if (p.age > 50)                            s += 0.2;
    return Math.min(s, 1);
  },

  // Vitamine D
  vitamine_d: (p) => {
    let s = 0.15; // baseline (manque courant en France)
    if (p.activity_level === "sedentary")      s += 0.3;
    if (p.age > 60)                            s += 0.3;
    if (p.goals.includes("immunity"))          s += 0.2;
    if (p.diet === "vegan")                    s += 0.15;
    return Math.min(s, 1);
  },

  // Mélatonine
  melatonine: (p) => {
    if (p.sleep_hours < 6)                     return 0.85;
    if (p.sleep_hours < 7)                     return 0.55;
    if (p.goals.includes("sleep"))             return 0.35;
    return 0;
  },

  // Zinc
  zinc: (p) => {
    let s = 0;
    if (p.goals.includes("immunity"))          s += 0.4;
    if (p.smoker)                              s += 0.3;
    if (p.diet === "vegan")                    s += 0.2;
    return Math.min(s, 1);
  },

  // Protéines
  proteine: (p) => {
    let s = 0;
    if (p.goals.includes("sport"))             s += 0.6;
    if (p.activity_level === "active")         s += 0.3;
    if (p.diet === "vegan")                    s += 0.2;
    return Math.min(s, 1);
  },

  // Probiotiques
  probiotique: (p) => {
    let s = 0;
    if (p.goals.includes("immunity"))          s += 0.3;
    if (p.conditions.includes("diabetes"))     s += 0.2;
    return Math.min(s, 1);
  },

  // Coenzyme Q10
  q10: (p) => {
    let s = 0;
    if (p.goals.includes("heart"))             s += 0.4;
    if (p.age > 50)                            s += 0.3;
    if (p.goals.includes("sport"))             s += 0.2;
    return Math.min(s, 1);
  },

  // Spiruline
  spiruline: (p) => {
    let s = 0;
    if (p.diet === "vegan")                    s += 0.4;
    if (p.goals.includes("sport"))             s += 0.3;
    if (p.goals.includes("weight"))            s += 0.2;
    return Math.min(s, 1);
  },

  // Vitamine C
  vitamine_c: (p) => {
    let s = 0;
    if (p.goals.includes("immunity"))          s += 0.4;
    if (p.smoker)                              s += 0.4;
    if (p.activity_level === "active")         s += 0.2;
    return Math.min(s, 1);
  },

  // Ashwagandha
  ashwagandha: (p) => {
    let s = 0;
    if (p.goals.includes("stress"))            s += 0.55;
    if (p.sleep_hours < 7)                     s += 0.2;
    if (p.goals.includes("sport"))             s += 0.15;
    return Math.min(s, 1);
  },

  // Fer
  fer: (p) => {
    let s = 0;
    if (p.sex === "F" && p.age < 50)           s += 0.3;
    if (p.diet === "vegan")                    s += 0.35;
    if (p.goals.includes("sport"))             s += 0.15;
    return Math.min(s, 1);
  },
};

// ─── Application des règles sur le catalogue ─────────────
export function applyRules(
  profile: HealthProfile,
  products: Product[],
  minScore = 0.3
): ScoredProduct[] {
  return products
    .map((product) => {
      let maxScore = 0;
      for (const tag of product.tags) {
        const rule = RULES[tag.toLowerCase()];
        if (rule) maxScore = Math.max(maxScore, rule(profile));
      }
      return {
        product_id: product.id,
        score: Math.round(maxScore * 100) / 100,
        reason: "",
        source: "rule" as const,
      };
    })
    .filter((r) => r.score >= minScore)
    .sort((a, b) => b.score - a.score);
}
