import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";

import { authRoutes } from "./routes/auth";
import { patientRoutes } from "./routes/patient";
import { pharmaRoutes } from "./routes/pharma";
import { productRoutes } from "./routes/products";
import { adminRoutes } from "./routes/admin";

const app = Fastify({ logger: true });

// ─── Plugins ──────────────────────────────────────────────
app.register(cors, {
  origin: process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",")
    : ["http://localhost:3000"],
});
app.register(jwt, { secret: process.env.JWT_SECRET! });

// ─── Routes ───────────────────────────────────────────────
app.register(authRoutes,    { prefix: "/auth" });
app.register(patientRoutes, { prefix: "/patient" });
app.register(pharmaRoutes,  { prefix: "/pharma" });
app.register(productRoutes, { prefix: "/products" });
app.register(adminRoutes,   { prefix: "/admin" });

app.get("/health", async () => ({ status: "ok" }));

// ─── Start ────────────────────────────────────────────────
const PORT = Number(process.env.PORT ?? 3001);

app.listen({ port: PORT, host: "0.0.0.0" }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log(`API running on http://localhost:${PORT}`);
});
