-- ─── Extensions ──────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Pharmacies ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pharmacies (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  plan       TEXT NOT NULL CHECK (plan IN ('starter', 'pro', 'enterprise')) DEFAULT 'starter',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Users ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID REFERENCES pharmacies(id) ON DELETE CASCADE,
  email       TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,  -- bcrypt hash
  role        TEXT NOT NULL CHECK (role IN ('patient', 'pharmacist', 'admin')),
  first_name  TEXT,
  last_name   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Health Profiles ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS health_profiles (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  age            INTEGER,
  sex            TEXT CHECK (sex IN ('M', 'F', 'other')),
  weight_kg      NUMERIC,
  height_cm      NUMERIC,
  goals          TEXT[]  NOT NULL DEFAULT '{}',
  conditions     TEXT[]  NOT NULL DEFAULT '{}',
  diet           TEXT CHECK (diet IN ('omnivore', 'vegetarian', 'vegan')),
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'moderate', 'active')),
  sleep_hours    NUMERIC,
  smoker         BOOLEAN NOT NULL DEFAULT false,
  health_score   INTEGER NOT NULL DEFAULT 0,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Products ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID REFERENCES pharmacies(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL CHECK (category IN ('complement', 'parapharmacie', 'hygiene')),
  tags        TEXT[] NOT NULL DEFAULT '{}',
  price       NUMERIC,
  ean         TEXT,
  description TEXT,
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Recommendations ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS recommendations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  reason     TEXT,
  score      NUMERIC NOT NULL,
  source     TEXT NOT NULL CHECK (source IN ('rule', 'ai', 'hybrid')),
  seen       BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Interactions ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS interactions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacist_id UUID REFERENCES users(id),
  patient_id    UUID REFERENCES users(id),
  note          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Indexes ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_pharmacy       ON users(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user        ON health_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_reco_user            ON recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_reco_created         ON recommendations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_pharmacy    ON products(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_interactions_patient ON interactions(patient_id);
