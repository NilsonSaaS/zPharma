import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { getProfile, upsertProfile } from "../db/queries/profiles";
import { getRecommendations } from "../db/queries/recommendations";
import { runRecommendationEngine } from "../engine/recommendation.engine";
import { computeHealthScore, getScoreLabel } from "../engine/health-score";
import { DISCLAIMER } from "@pharmapersonal/config";

const ProfileSchema = z.object({
  age: z.number().int().min(1).max(120),
  sex: z.enum(["M", "F", "other"]),
  weight_kg: z.number().positive(),
  height_cm: z.number().positive(),
  goals: z.array(z.enum(["sleep", "stress", "immunity", "sport", "weight", "heart"])),
  conditions: z.array(z.enum(["diabetes", "hypertension", "cholesterol", "none"])),
  diet: z.enum(["omnivore", "vegetarian", "vegan"]),
  activity_level: z.enum(["sedentary", "moderate", "active"]),
  sleep_hours: z.number().min(0).max(24),
  smoker: z.boolean(),
});

export async function patientRoutes(app: FastifyInstance) {
  // GET /patient/profile
  app.get("/profile", { preHandler: requireAuth }, async (req, reply) => {
    const profile = await getProfile(req.user.id);
    if (!profile) return reply.status(404).send({ error: "Profil non trouvé" });
    return reply.send({ data: profile });
  });

  // POST /patient/profile — créer ou mettre à jour
  app.post("/profile", { preHandler: requireAuth }, async (req, reply) => {
    const body = ProfileSchema.parse(req.body);
    const profile = await upsertProfile(req.user.id, body as any);

    // Lancer le moteur de recommandation en arrière-plan
    runRecommendationEngine(req.user.id, req.user.pharmacy_id, profile).catch(
      console.error
    );

    return reply.status(201).send({ data: profile });
  });

  // GET /patient/score
  app.get("/score", { preHandler: requireAuth }, async (req, reply) => {
    const profile = await getProfile(req.user.id);
    if (!profile) return reply.status(404).send({ error: "Profil non trouvé" });

    const { total, details } = computeHealthScore(profile);
    const { label, color } = getScoreLabel(total);

    return reply.send({
      data: { score: total, label, color, details },
    });
  });

  // GET /patient/recommendations
  app.get("/recommendations", { preHandler: requireAuth }, async (req, reply) => {
    const recs = await getRecommendations(req.user.id, 5);
    return reply.send({
      data: recs,
      disclaimer: DISCLAIMER,
    });
  });

  // POST /patient/recommendations/refresh — forcer recalcul
  app.post("/recommendations/refresh", { preHandler: requireAuth }, async (req, reply) => {
    const profile = await getProfile(req.user.id);
    if (!profile) return reply.status(404).send({ error: "Profil non trouvé" });

    const result = await runRecommendationEngine(
      req.user.id,
      req.user.pharmacy_id,
      profile
    );

    return reply.send({ data: result });
  });
}
