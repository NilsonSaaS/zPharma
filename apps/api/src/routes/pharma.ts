import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireRole } from "../middleware/auth";
import { listPatientsByPharmacy } from "../db/queries/users";
import { getProfile } from "../db/queries/profiles";
import { getRecommendations } from "../db/queries/recommendations";
import { query, queryOne } from "../db/client";
import { HEALTH_SCORE } from "@pharmapersonal/config";

export async function pharmaRoutes(app: FastifyInstance) {
  const requirePharma = requireRole(["pharmacist", "admin"]);

  // GET /pharma/patients — liste des patients avec score
  app.get("/patients", { preHandler: await requirePharma }, async (req, reply) => {
    const patients = await listPatientsByPharmacy(req.user.pharmacy_id);

    const summaries = await Promise.all(
      patients.map(async (patient) => {
        const profile = await getProfile(patient.id);
        return { user: patient, profile, health_score: profile?.health_score ?? null };
      })
    );

    return reply.send({ data: summaries });
  });

  // GET /pharma/patients/:id — détail patient
  app.get("/patients/:id", { preHandler: await requirePharma }, async (req, reply) => {
    const { id } = req.params as { id: string };

    const patient = await queryOne<any>(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.created_at
       FROM users u
       WHERE u.id = $1 AND u.pharmacy_id = $2 AND u.role = 'patient'`,
      [id, req.user.pharmacy_id]
    );

    if (!patient) return reply.status(404).send({ error: "Patient introuvable" });

    const profile = await getProfile(id);
    const recommendations = await getRecommendations(id, 5);
    const interactions = await query<any>(
      `SELECT i.*, u.first_name as pharma_first_name
       FROM interactions i
       JOIN users u ON i.pharmacist_id = u.id
       WHERE i.patient_id = $1
       ORDER BY i.created_at DESC LIMIT 20`,
      [id]
    );

    return reply.send({ data: { patient, profile, recommendations, interactions } });
  });

  // POST /pharma/patients/:id/note — ajouter une note
  app.post("/patients/:id/note", { preHandler: await requirePharma }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const { note } = z.object({ note: z.string().min(1) }).parse(req.body);

    const interaction = await queryOne<any>(
      `INSERT INTO interactions (pharmacist_id, patient_id, note)
       VALUES ($1, $2, $3) RETURNING *`,
      [req.user.id, id, note]
    );

    return reply.status(201).send({ data: interaction });
  });

  // GET /pharma/alerts — patients avec score bas ou inactifs
  app.get("/alerts", { preHandler: await requirePharma }, async (req, reply) => {
    const lowScore = await query<any>(
      `SELECT u.id, u.first_name, u.last_name, u.email,
              hp.health_score, hp.updated_at
       FROM users u
       JOIN health_profiles hp ON hp.user_id = u.id
       WHERE u.pharmacy_id = $1
         AND hp.health_score < $2
       ORDER BY hp.health_score ASC`,
      [req.user.pharmacy_id, HEALTH_SCORE.ALERT_THRESHOLD]
    );

    const inactive = await query<any>(
      `SELECT u.id, u.first_name, u.last_name, u.email,
              hp.updated_at
       FROM users u
       JOIN health_profiles hp ON hp.user_id = u.id
       WHERE u.pharmacy_id = $1
         AND hp.updated_at < now() - INTERVAL '60 days'
       ORDER BY hp.updated_at ASC`,
      [req.user.pharmacy_id]
    );

    return reply.send({
      data: {
        low_score: lowScore,
        inactive,
      },
    });
  });

  // GET /pharma/segments — segmentation patients
  app.get("/segments", { preHandler: await requirePharma }, async (req, reply) => {
    const segments = await query<any>(
      `SELECT
         CASE
           WHEN hp.health_score >= 75 THEN 'excellent'
           WHEN hp.health_score >= 55 THEN 'good'
           WHEN hp.health_score >= 40 THEN 'average'
           ELSE 'critical'
         END AS segment,
         COUNT(*) AS count,
         AVG(hp.health_score)::int AS avg_score
       FROM users u
       JOIN health_profiles hp ON hp.user_id = u.id
       WHERE u.pharmacy_id = $1 AND u.role = 'patient'
       GROUP BY 1
       ORDER BY avg_score DESC`,
      [req.user.pharmacy_id]
    );

    return reply.send({ data: segments });
  });
}
