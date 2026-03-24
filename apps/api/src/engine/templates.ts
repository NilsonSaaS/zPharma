import type { HealthProfile, Product } from "@pharmapersonal/types";

// ─── Templates par tag × contexte profil ─────────────────
// Chaque tag a plusieurs phrases selon le contexte dominant du patient
const TAG_TEMPLATES: Record<string, (p: HealthProfile) => string> = {
  magnesium: (p) => {
    if (p.goals.includes("stress") && p.goals.includes("sleep"))
      return "Aide à réduire le stress et améliore la qualité du sommeil";
    if (p.goals.includes("stress"))
      return "Contribue à la réduction de la fatigue et du stress";
    if (p.goals.includes("sleep"))
      return "Favorise la détente musculaire et un meilleur endormissement";
    if (p.activity_level === "active")
      return "Compense les pertes en magnésium liées à l'effort sportif";
    return "Soutient le système nerveux et réduit la fatigue";
  },

  omega3: (p) => {
    if (p.conditions.includes("cholesterol"))
      return "Contribue au maintien d'un taux de triglycérides normal";
    if (p.diet === "vegan" || p.diet === "vegetarian")
      return "Complète les apports en oméga-3 souvent insuffisants sans poisson";
    if (p.goals.includes("heart"))
      return "Soutient la fonction cardiaque et la circulation sanguine";
    if (p.age > 50)
      return "Protège la santé cardiovasculaire et cognitive avec l'âge";
    return "Contribue au bon fonctionnement cardiovasculaire";
  },

  vitamine_d: (p) => {
    if (p.activity_level === "sedentary")
      return "Compense le manque d'exposition solaire lié à la sédentarité";
    if (p.age > 60)
      return "Essentielle pour maintenir la densité osseuse après 60 ans";
    if (p.goals.includes("immunity"))
      return "Renforce les défenses immunitaires, surtout en hiver";
    if (p.diet === "vegan")
      return "Compense l'absence de vitamine D d'origine animale";
    return "Aide à maintenir des os solides et un système immunitaire actif";
  },

  melatonine: (p) => {
    if (p.sleep_hours < 6)
      return "Aide à retrouver un cycle de sommeil régulier en cas d'insomnie";
    if (p.sleep_hours < 7)
      return "Facilite l'endormissement pour atteindre 7-8h de sommeil";
    return "Régule le rythme circadien et raccourcit le temps d'endormissement";
  },

  zinc: (p) => {
    if (p.smoker)
      return "Le tabac augmente les besoins en zinc — essentiel pour l'immunité";
    if (p.goals.includes("immunity"))
      return "Soutient les défenses naturelles et réduit la durée des infections";
    if (p.diet === "vegan")
      return "Compense la faible absorption du zinc d'origine végétale";
    return "Contribue au bon fonctionnement du système immunitaire";
  },

  proteine: (p) => {
    if (p.goals.includes("sport") && p.activity_level === "active")
      return "Soutient la récupération musculaire après l'entraînement";
    if (p.goals.includes("weight"))
      return "Favorise la satiété et préserve la masse musculaire";
    if (p.diet === "vegan")
      return "Complète les apports protéiques souvent insuffisants en alimentation végane";
    return "Contribue à la construction et au maintien de la masse musculaire";
  },

  probiotique: (p) => {
    if (p.conditions.includes("diabetes"))
      return "Soutient l'équilibre du microbiote, lié à la régulation glycémique";
    if (p.goals.includes("immunity"))
      return "Renforce l'immunité intestinale, siège de 70% du système immunitaire";
    return "Rééquilibre le microbiote et améliore le confort digestif";
  },

  q10: (p) => {
    if (p.goals.includes("heart"))
      return "Soutient la fonction cardiaque et la production d'énergie cellulaire";
    if (p.age > 50)
      return "Les niveaux de Q10 baissent avec l'âge — complément utile après 50 ans";
    if (p.goals.includes("sport"))
      return "Améliore la production d'énergie et réduit la fatigue à l'effort";
    return "Contribue à la production d'énergie et protège les cellules";
  },

  spiruline: (p) => {
    if (p.diet === "vegan")
      return "Source végétale de protéines, fer et vitamine B12 pour les vegans";
    if (p.goals.includes("sport"))
      return "Améliore l'endurance et accélère la récupération sportive";
    if (p.goals.includes("weight"))
      return "Riche en protéines et nutriments, favorise la satiété";
    return "Superaliment complet pour booster l'énergie et la vitalité";
  },

  vitamine_c: (p) => {
    if (p.smoker)
      return "Le tabac détruit la vitamine C — une supplémentation est recommandée";
    if (p.goals.includes("immunity"))
      return "Renforce les défenses immunitaires et réduit la durée des rhumes";
    if (p.activity_level === "active")
      return "Antioxydant puissant qui protège les muscles après l'effort";
    return "Soutient le système immunitaire et réduit la fatigue";
  },

  ashwagandha: (p) => {
    if (p.goals.includes("stress") && p.sleep_hours < 7)
      return "Adaptogène qui réduit le cortisol, le stress et améliore le sommeil";
    if (p.goals.includes("stress"))
      return "Aide à gérer le stress chronique et renforce la résistance mentale";
    if (p.goals.includes("sport"))
      return "Améliore les performances sportives et la récupération musculaire";
    return "Plante adaptogène qui soutient la résistance au stress";
  },

  fer: (p) => {
    if (p.sex === "F" && p.age < 50)
      return "Compense les pertes en fer liées aux menstruations";
    if (p.diet === "vegan")
      return "Compense la faible biodisponibilité du fer végétal";
    if (p.goals.includes("sport"))
      return "Prévient la fatigue sportive souvent liée à un déficit en fer";
    return "Contribue à réduire la fatigue et soutient la formation des globules rouges";
  },
};

// ─── Fonction principale ──────────────────────────────────
export function generateTemplateReason(
  product: Product,
  profile: HealthProfile
): string {
  // Cherche le meilleur tag du produit qui a un template
  let bestReason = "";
  let bestScore = -1;

  for (const tag of product.tags) {
    const templateFn = TAG_TEMPLATES[tag.toLowerCase()];
    if (templateFn) {
      // Score le tag selon la pertinence au profil
      const tagScore = scoreTagForProfile(tag, profile);
      if (tagScore > bestScore) {
        bestScore = tagScore;
        bestReason = templateFn(profile);
      }
    }
  }

  if (bestReason) return bestReason;

  // Fallback générique si aucun tag connu
  const categoryPhrases: Record<string, string> = {
    complement: "Complément adapté à votre profil et vos objectifs",
    parapharmacie: "Produit recommandé pour votre hygiène de vie",
    hygiene: "Produit de soin adapté à vos besoins quotidiens",
  };
  return categoryPhrases[product.category] ?? "Recommandé pour votre profil";
}

function scoreTagForProfile(tag: string, p: HealthProfile): number {
  const goalMatch: Record<string, string[]> = {
    magnesium: ["stress", "sleep"],
    omega3: ["heart"],
    vitamine_d: ["immunity"],
    melatonine: ["sleep"],
    zinc: ["immunity"],
    proteine: ["sport"],
    probiotique: ["immunity"],
    q10: ["heart", "sport"],
    spiruline: ["sport", "weight"],
    vitamine_c: ["immunity"],
    ashwagandha: ["stress", "sleep"],
    fer: ["sport"],
  };

  const relatedGoals = goalMatch[tag] ?? [];
  return relatedGoals.filter((g) => p.goals.includes(g as any)).length;
}
