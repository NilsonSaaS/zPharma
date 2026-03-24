// Script de migration — exécuter avec : node apps/api/src/db/migrate.js
require("dotenv").config({ path: "apps/api/.env" });
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

async function migrate() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const schema = fs.readFileSync(
    path.join(__dirname, "schema.sql"),
    "utf-8"
  );

  try {
    await pool.query(schema);
    console.log("Migration reussie.");
  } catch (err) {
    console.error("Erreur migration:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
