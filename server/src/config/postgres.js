import pkg from "pg";
const { Pool } = pkg;

import dotenv from "dotenv";

// Load environment
dotenv.config({
  path:
process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development",
});

let pool = null;

export const getPool = () => {
  if (pool) return pool;
  if (!process.env.SUPABASE_DB_URL) return null;

  pool = new Pool({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  return pool;
};

// Test connection (called in server start)
export const connectPostgres = async () => {
  const p = getPool();

  if (!p) {
    console.warn(
      "SUPABASE_DB_URL not set; skipping PostgreSQL connection (prompt history disabled).",
    );
    return;
  }

  try {
    const client = await p.connect();

    console.log("PostgreSQL connected successfully");

    client.release(); // IMPORTANT
  } catch (error) {
    console.error("PostgreSQL connection failed:", error.message);
  }
};

export { pool };
