export const HEALTH_SCORE = {
  MIN: 0,
  MAX: 100,
  ALERT_THRESHOLD: 40,   // en dessous → alerte pharmacien
  GOOD_THRESHOLD: 70,    // au dessus → bon
};

export const RECO = {
  MIN_RULE_SCORE: 0.3,   // seuil minimum pour garder une reco
  TOP_N_RULES: 10,       // top N avant enrichissement IA
  FINAL_TOP_N: 5,        // recos affichées au patient
  AI_MODEL: "gpt-4o-mini",
};

export const PLANS = {
  starter: { max_patients: 100, max_pharmacists: 1, max_products: 50 },
  pro:     { max_patients: 500, max_pharmacists: 3, max_products: Infinity },
  enterprise: { max_patients: Infinity, max_pharmacists: Infinity, max_products: Infinity },
};

export const DISCLAIMER =
  "Ces recommandations sont fournies à titre informatif uniquement. " +
  "Elles ne constituent pas un diagnostic médical. " +
  "Consultez votre pharmacien ou médecin pour tout problème de santé.";

export const GOAL_LABELS: Record<string, string> = {
  sleep: "Améliorer mon sommeil",
  stress: "Réduire mon stress",
  immunity: "Renforcer mon immunité",
  sport: "Soutenir ma pratique sportive",
  weight: "Gérer mon poids",
  heart: "Prendre soin de mon cœur",
};

export const CONDITION_LABELS: Record<string, string> = {
  diabetes: "Diabète",
  hypertension: "Hypertension",
  cholesterol: "Cholestérol",
  none: "Aucune de ces situations",
};
