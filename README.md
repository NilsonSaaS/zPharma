# PharmaPersonal — Guide de déploiement gratuit

> Stack 100% gratuite : GitHub + Vercel + Railway

---

## Coût total : 0 €

| Service | Usage | Coût |
|---------|-------|------|
| GitHub | Code source | Gratuit |
| Vercel | Frontend Next.js | Gratuit (Hobby) |
| Railway | API Node.js + PostgreSQL | Gratuit ($5 crédit/mois offert) |

**Aucune clé API IA** — le moteur de recommandation fonctionne avec des règles + templates.

---

## Architecture

```
GitHub (code)
    ├── Vercel      → apps/web  (Next.js, port 3000)
    └── Railway
          ├── API   → apps/api  (Fastify, port 3001)
          └── DB    → PostgreSQL (inclus Railway)
```

---

## Étape 1 — GitHub

```bash
# Dans le dossier du projet
git init
git add .
git commit -m "initial commit"

# Sur github.com → New repository → "pharmapersonal"
git remote add origin https://github.com/TON_USERNAME/pharmapersonal.git
git push -u origin main
```

---

## Étape 2 — Railway (API + Base de données)

### 2a. Créer un compte Railway
1. Va sur [railway.app](https://railway.app)
2. **Sign up with GitHub** (lié à ton repo)
3. Pas de carte bancaire requise — $5 de crédit offert par mois

### 2b. Créer le projet Railway
1. **New Project** → **Deploy from GitHub repo**
2. Sélectionne ton repo `pharmapersonal`
3. Railway détecte le `railway.toml` automatiquement

### 2c. Ajouter PostgreSQL
1. Dans ton projet Railway → **+ New** → **Database** → **PostgreSQL**
2. C'est tout — Railway crée la base automatiquement

### 2d. Variables d'environnement API
Dans ton service API sur Railway → **Variables** → ajoute :

```
DATABASE_URL    → clique "Add Reference" → sélectionne ${{Postgres.DATABASE_URL}}
JWT_SECRET      → une chaîne aléatoire (ex: abc123xyz789...)
FRONTEND_URL    → ton URL Vercel (à compléter après l'étape 3)
NODE_ENV        → production
PORT            → 3001
```

### 2e. Migrer la base de données
Dans Railway → ton service PostgreSQL → **Query** → colle et exécute le contenu de :
`apps/api/src/db/schema.sql`

Puis pour les données de test, exécute :
`apps/api/src/db/seed.sql`

### 2f. Noter ton URL Railway
Format : `https://pharmapersonal-api-XXXX.up.railway.app`
→ Tu en auras besoin pour Vercel.

---

## Étape 3 — Vercel (Frontend)

### 3a. Créer un compte Vercel
1. Va sur [vercel.com](https://vercel.com)
2. **Sign up with GitHub**

### 3b. Importer le projet
1. **New Project** → importe `pharmapersonal`
2. Vercel détecte le `vercel.json` automatiquement

### 3c. Configuration du build
Vercel te demandera les settings — laisse les valeurs détectées :
- **Framework** : Next.js
- **Root Directory** : `apps/web`
- **Build Command** : `pnpm build`
- **Output Directory** : `.next`

### 3d. Variables d'environnement
Dans Vercel → **Settings** → **Environment Variables** :

```
NEXT_PUBLIC_API_URL → https://ton-api.up.railway.app
```

### 3e. Déployer
Clique **Deploy** → attends ~2 minutes → ton app est en ligne !

### 3f. Mettre à jour Railway avec l'URL Vercel
Retourne dans Railway → Variables de l'API :
```
FRONTEND_URL → https://ton-app.vercel.app
```

---

## Résumé des URLs finales

```
Frontend : https://pharmapersonal.vercel.app
API      : https://pharmapersonal-api.up.railway.app
```

---

## Déploiements automatiques

À partir de maintenant, **chaque `git push` sur `main`** déclenche automatiquement :
- Vercel → rebuild du frontend
- Railway → rebuild de l'API

```bash
# Workflow de travail
git add .
git commit -m "ma modification"
git push
# → déployé en ~2 minutes
```

---

## Développement local

### Prérequis
- Node.js 20+
- pnpm (`npm install -g pnpm`)
- Docker (pour PostgreSQL local)

### Setup

```bash
# 1. Installer les dépendances
pnpm install

# 2. Copier les fichiers d'environnement
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# 3. Lancer PostgreSQL local
docker-compose up -d

# 4. Créer les tables
node apps/api/src/db/migrate.js

# 5. (Optionnel) Données de test
# Ouvrir http://localhost:5432 ou psql et exécuter seed.sql

# 6. Lancer en dev
pnpm dev
# Frontend : http://localhost:3000
# API      : http://localhost:3001
```

---

## Structure du projet

```
pharmapersonal/
├── apps/
│   ├── web/                    → Next.js frontend (Vercel)
│   │   ├── app/
│   │   │   ├── (patient)/      → Onboarding, Dashboard patient
│   │   │   ├── (pharma)/       → Dashboard pharmacien, Fiche patient
│   │   │   └── login/
│   │   ├── components/
│   │   │   ├── health-score/   → Gauge SVG animée
│   │   │   ├── rec-card/       → Carte recommandation
│   │   │   └── patient-table/  → Tableau patients
│   │   └── lib/
│   │       ├── api.ts          → Client Axios typé
│   │       └── store.ts        → Zustand (auth + profil)
│   │
│   └── api/                    → Fastify backend (Railway)
│       └── src/
│           ├── engine/
│           │   ├── rules/      → 12 règles déterministes
│           │   ├── templates.ts→ Raisons personnalisées SANS IA
│           │   └── health-score.ts → Score 0-100
│           ├── db/
│           │   ├── schema.sql  → Tables PostgreSQL
│           │   └── queries/    → Requêtes typées
│           └── routes/         → auth, patient, pharma, products
│
└── packages/
    ├── types/                  → Types TypeScript partagés
    └── config/                 → Constantes partagées
```

---

## Moteur de recommandation (sans IA)

```
Profil patient
      ↓
12 règles par tag produit
(magnésium, oméga-3, mélatonine, zinc, etc.)
      ↓
Score de pertinence 0→1 par produit
      ↓
Top 5 produits sélectionnés
      ↓
Templates personnalisés
(phrase adaptée au profil : âge, objectifs, conditions, habitudes)
      ↓
Recommandations affichées
```

Exemples de templates générés :
- Magnésium + profil stressé → *"Aide à réduire le stress et favorise la détente musculaire"*
- Vitamine D + sédentaire → *"Compense le manque d'exposition solaire lié à la sédentarité"*
- Fer + femme < 50 ans → *"Compense les pertes en fer liées aux menstruations"*

---

## Avertissement légal

Les recommandations sont à titre informatif uniquement.
Elles ne constituent pas un diagnostic médical.
