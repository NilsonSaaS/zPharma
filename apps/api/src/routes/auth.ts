import type { FastifyInstance } from "fastify";
import { z } from "zod";
import * as bcrypt from "bcryptjs";
import { findUserByEmail, createUser } from "../db/queries/users";
import { queryOne } from "../db/client";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  pharmacy_id: z.string().uuid(),
  role: z.enum(["patient", "pharmacist"]),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
});

export async function authRoutes(app: FastifyInstance) {
  // POST /auth/login
  app.post("/login", async (req, reply) => {
    const body = LoginSchema.parse(req.body);
    const user = await findUserByEmail(body.email);

    if (!user) {
      return reply.status(401).send({ error: "Email ou mot de passe incorrect" });
    }

    const row = await queryOne<{ password: string }>(
      "SELECT password FROM users WHERE id = $1",
      [user.id]
    );

    const valid = await bcrypt.compare(body.password, row!.password);
    if (!valid) {
      return reply.status(401).send({ error: "Email ou mot de passe incorrect" });
    }

    const token = app.jwt.sign(
      { id: user.id, role: user.role, pharmacy_id: user.pharmacy_id },
      { expiresIn: "7d" }
    );

    return reply.send({ token, user });
  });

  // POST /auth/register
  app.post("/register", async (req, reply) => {
    const body = RegisterSchema.parse(req.body);
    const existing = await findUserByEmail(body.email);

    if (existing) {
      return reply.status(409).send({ error: "Email déjà utilisé" });
    }

    const hashed = await bcrypt.hash(body.password, 10);
    const user = await createUser({ ...body, password: hashed });

    const token = app.jwt.sign(
      { id: user.id, role: user.role, pharmacy_id: user.pharmacy_id },
      { expiresIn: "7d" }
    );

    return reply.status(201).send({ token, user });
  });

  // POST /auth/logout  (côté client on supprime le token)
  app.post("/logout", async (_, reply) => {
    return reply.send({ success: true });
  });
}
