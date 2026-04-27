import pkg from "pg";
const { Pool } = pkg;

import { loadEnv } from "./env.js";

loadEnv();

let pool = null;

const validateConnectionString = (connectionString) => {
  let url;
  try {
    url = new URL(connectionString);
  } catch {
    throw new Error(
      "SUPABASE_DB_URL is invalid (must be a full postgres connection string)",
    );
  }

  const protocol = url.protocol || "";
  if (!protocol.startsWith("postgres")) {
    throw new Error(
      `SUPABASE_DB_URL protocol must be postgres/postgresql (got ${protocol || "empty"})`,
    );
  }

  if (!url.hostname) {
    throw new Error("SUPABASE_DB_URL hostname is missing");
  }

  // Render log: getaddrinfo ENOTFOUND base -> hostname becomes "base" when env var is mis-set.
  if (process.env.NODE_ENV === "production" && url.hostname === "base") {
    throw new Error(
      "SUPABASE_DB_URL is pointing to host 'base' (Render env var is misconfigured). Set SUPABASE_DB_URL to the exact Supabase connection string.",
    );
  }

  return url;
};

const redactConnectionString = (connectionString) => {
  try {
    const url = new URL(connectionString);
    const user = url.username ? decodeURIComponent(url.username) : "";
    const host = url.hostname || "";
    const port = url.port || "";
    const db = url.pathname ? url.pathname.replace(/^\//, "") : "";
    return `postgresql://${user}:***@${host}${port ? `:${port}` : ""}/${db}`;
  } catch {
    return "<invalid connection string>";
  }
};

export const getPool = () => {
  if (pool) return pool;
  if (!process.env.SUPABASE_DB_URL) {
    throw new Error("SUPABASE_DB_URL is missing; PostgreSQL is required");
  }

  validateConnectionString(process.env.SUPABASE_DB_URL);

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

  pool.on("error", (err) => {
    console.error("PostgreSQL pool error:", {
      message: err?.message,
      code: err?.code,
      stack: err?.stack,
    });
  });

  return pool;
};

// Test connection (called in server start)
export const connectPostgres = async () => {
  const p = getPool();

  try {
    const client = await p.connect();

    const info = await client.query(`
      select
        current_database() as db,
        current_user as "user",
        inet_server_addr()::text as server_addr,
        inet_server_port() as server_port,
        current_setting('search_path') as search_path
    `);

    console.log("PostgreSQL connected successfully", {
      connection: redactConnectionString(process.env.SUPABASE_DB_URL),
      ...info.rows?.[0],
    });

    client.release(); // IMPORTANT
  } catch (error) {
    console.error("PostgreSQL connection failed:", {
      connection: redactConnectionString(process.env.SUPABASE_DB_URL),
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
    });
    throw error;
  }
};

export { pool };
