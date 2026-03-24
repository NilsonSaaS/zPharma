// ─── Enums ────────────────────────────────────────────────
export type UserRole = "patient" | "pharmacist" | "admin";
export type Plan = "starter" | "pro" | "enterprise";
export type Sex = "M" | "F" | "other";
export type ActivityLevel = "sedentary" | "moderate" | "active";
export type Diet = "omnivore" | "vegetarian" | "vegan";
export type RecoSource = "rule" | "ai" | "hybrid";
export type ProductCategory = "complement" | "parapharmacie" | "hygiene";

export type Goal =
  | "sleep"
  | "stress"
  | "immunity"
  | "sport"
  | "weight"
  | "heart";

export type Condition =
  | "diabetes"
  | "hypertension"
  | "cholesterol"
  | "none";

// ─── Entités ──────────────────────────────────────────────
export interface User {
  id: string;
  pharmacy_id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  plan: Plan;
  created_at: string;
}

export interface HealthProfile {
  id: string;
  user_id: string;
  age: number;
  sex: Sex;
  weight_kg: number;
  height_cm: number;
  goals: Goal[];
  conditions: Condition[];
  diet: Diet;
  activity_level: ActivityLevel;
  sleep_hours: number;
  smoker: boolean;
  health_score: number;
  updated_at: string;
}

export interface Product {
  id: string;
  pharmacy_id: string;
  name: string;
  category: ProductCategory;
  tags: string[];
  price: number;
  ean?: string;
  active: boolean;
}

export interface Recommendation {
  id: string;
  user_id: string;
  product_id: string;
  reason: string;
  score: number;
  source: RecoSource;
  seen: boolean;
  created_at: string;
  product?: Product;
}

export interface Interaction {
  id: string;
  pharmacist_id: string;
  patient_id: string;
  note: string;
  created_at: string;
}

// ─── API Payloads ─────────────────────────────────────────
export interface CreateProfilePayload {
  age: number;
  sex: Sex;
  weight_kg: number;
  height_cm: number;
  goals: Goal[];
  conditions: Condition[];
  diet: Diet;
  activity_level: ActivityLevel;
  sleep_hours: number;
  smoker: boolean;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface PatientSummary {
  user: User;
  profile: HealthProfile;
  latest_recommendations: Recommendation[];
}
