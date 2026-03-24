import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../db/queries/products";

const ProductSchema = z.object({
  name: z.string().min(1),
  category: z.enum(["complement", "parapharmacie", "hygiene"]),
  tags: z.array(z.string()),
  price: z.number().positive().optional(),
  ean: z.string().optional(),
  description: z.string().optional(),
});

export async function productRoutes(app: FastifyInstance) {
  // GET /products — catalogue de la pharmacie
  app.get("/", { preHandler: requireAuth }, async (req, reply) => {
    const products = await getProducts(req.user.pharmacy_id);
    return reply.send({ data: products });
  });

  // POST /products
  app.post("/", { preHandler: await requireRole(["pharmacist", "admin"]) }, async (req, reply) => {
    const body = ProductSchema.parse(req.body);
    const product = await createProduct({
      ...body,
      pharmacy_id: req.user.pharmacy_id,
      price: body.price ?? 0,
    });
    return reply.status(201).send({ data: product });
  });

  // PUT /products/:id
  app.put("/:id", { preHandler: await requireRole(["pharmacist", "admin"]) }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = ProductSchema.partial().parse(req.body);
    const product = await updateProduct(id, req.user.pharmacy_id, body as any);
    if (!product) return reply.status(404).send({ error: "Produit introuvable" });
    return reply.send({ data: product });
  });

  // DELETE /products/:id  (soft delete)
  app.delete("/:id", { preHandler: await requireRole(["pharmacist", "admin"]) }, async (req, reply) => {
    const { id } = req.params as { id: string };
    await deleteProduct(id, req.user.pharmacy_id);
    return reply.send({ success: true });
  });
}
