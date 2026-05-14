import pkg from "pg";
const { Pool } = pkg;

import { loadEnv } from "./env.js";

loadEnv();

class PostgresDB {
  static pool = null;

  static validateConnectionString(connectionString) {
    let url;

    try {
      url = new URL(connectionString);
    } catch {
      throw new Error(
        "SUPABASE_DB_URL is invalid",
      );
    }

    const protocol = url.protocol || "";

    if (!protocol.startsWith("postgres")) {
      throw new Error(
        `SUPABASE_DB_URL protocol must be postgres/postgresql`,
      );
    }

    if (!url.hostname) {
      throw new Error("SUPABASE_DB_URL hostname is missing");
    }

    return url;
  }

  static getPool() {
    if (this.pool) {
      return this.pool;
    }

    const connectionString = process.env.SUPABASE_DB_URL;

    if (!connectionString) {
      throw new Error("SUPABASE_DB_URL is missing");
    }

    this.validateConnectionString(connectionString);

    this.pool = new Pool({
      connectionString,
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    this.pool.on("error", (err) => {
      console.error("PostgreSQL pool error:", err);
    });

    return this.pool;
  }

  static async connect() {
    const pool = this.getPool();

    try {
      const client = await pool.connect();

      console.log("PostgreSQL connected successfully");

      client.release();

      return pool;

    } catch (error) {
      console.error("PostgreSQL connection failed:", error);

      throw error;
    }
  }
}

export default PostgresDB;