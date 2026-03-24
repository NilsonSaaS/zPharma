import type { FastifyRequest, FastifyReply } from "fastify";
import { findUserById } from "../db/queries/users";

export interface AuthUser {
  id: string;
  pharmacy_id: string;
  role: string;
}

declare module "fastify" {
  interface FastifyRequest {
    user: AuthUser;
  }
}

export async function requireAuth(
  req: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    await req.jwtVerify();
    const payload = req.user as any;
    const user = await findUserById(payload.id);
    if (!user) {
      reply.status(401).send({ error: "Utilisateur introuvable" });
      return;
    }
    req.user = { id: user.id, pharmacy_id: user.pharmacy_id!, role: user.role };
  } catch {
    reply.status(401).send({ error: "Non authentifié" });
  }
}

export async function requireRole(roles: string[]) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    await requireAuth(req, reply);
    if (!roles.includes(req.user.role)) {
      reply.status(403).send({ error: "Accès refusé" });
    }
  };
}
