import pkg from "pg";
const { Pool } = pkg;

import dotenv from "dotenv";

// Load environment
dotenv.config({
  path: process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development",
});

// Validate ENV (fail fast)
if (!process.env.SUPABASE_DB_URL) {
  throw new Error("SUPABASE_DB_URL is missing in environment variables");
}

// Create Pool (connection manager)
export const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
  max: 10, // max clients in pool
  idleTimeoutMillis: 30000, // close idle clients after 30s
  connectionTimeoutMillis: 5000, // fail if cannot connect in 5s
});

//  Function to test DB connection on startup
export const connectPostgres = async () => {
  try {
    const client = await pool.connect();

    console.log("PostgreSQL connected successfully");

    client.release(); // VERY IMPORTANT (return to pool)
  } catch (error) {
    console.error("PostgreSQL connection failed:", error.message);
    process.exit(1); // kill app if DB not connected
  }
};