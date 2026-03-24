import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireRole } from "../middleware/auth";
import { query, queryOne } from "../db/client";

const PharmacySchema = z.object({
  name: z.string().min(1),
  plan: z.enum(["starter", "pro", "enterprise"]).default("starter"),
});

export async function adminRoutes(app: FastifyInstance) {
  const requireAdmin = requireRole(["admin"]);

  // GET /admin/pharmacies
  app.get("/pharmacies", { preHandler: await requireAdmin }, async (_, reply) => {
    const pharmacies = await query<any>("SELECT * FROM pharmacies ORDER BY created_at DESC");
    return reply.send({ data: pharmacies });
  });

  // POST /admin/pharmacies
  app.post("/pharmacies", { preHandler: await requireAdmin }, async (req, reply) => {
    const body = PharmacySchema.parse(req.body);
    const pharmacy = await queryOne<any>(
      `INSERT INTO pharmacies (name, plan) VALUES ($1, $2) RETURNING *`,
      [body.name, body.plan]
    );
    return reply.status(201).send({ data: pharmacy });
  });

  // PUT /admin/pharmacies/:id/plan
  app.put("/pharmacies/:id/plan", { preHandler: await requireAdmin }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const { plan } = z.object({ plan: z.enum(["starter", "pro", "enterprise"]) }).parse(req.body);
    const pharmacy = await queryOne<any>(
      `UPDATE pharmacies SET plan = $1 WHERE id = $2 RETURNING *`,
      [plan, id]
    );
    if (!pharmacy) return reply.status(404).send({ error: "Pharmacie introuvable" });
    return reply.send({ data: pharmacy });
  });
}
