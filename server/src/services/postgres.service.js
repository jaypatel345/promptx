import { getPool } from "../config/postgres.js";

const postgresService = {
  savePromptHistory: async ({ user_id, prompt, response, model }) => {
    const pool = getPool();

    const query = `
      INSERT INTO public.prompt_history (user_id, prompt, response, model)
      VALUES ($1, $2, $3, $4)
      RETURNING id, created_at
    `;

    const values = [user_id, prompt, response, model];

    try {
      const result = await pool.query(query, values);
      return {
        success: true,
        rowCount: result.rowCount,
        row: result.rows?.[0] || null,
      };
    } catch (error) {
      console.error("PostgreSQL INSERT failed:", {
        message: error?.message,
        code: error?.code,
        detail: error?.detail,
        hint: error?.hint,
        schema: error?.schema,
        table: error?.table,
        column: error?.column,
        constraint: error?.constraint,
        where: error?.where,
        routine: error?.routine,
      });
      throw error;
    }
  },
  saveUsageLog: async ({ user_id, action, tokens_used, metadata }) => {
    const pool = getPool();

    if (!pool) {
      throw new Error("Postgres pool not initialized");
    }
    const query = `
      INSERT INTO public.usage_logs (user_id, action, tokens_used, metadata)
      VALUES ($1, $2, $3, $4)
      RETURNING id, created_at
    `;

    const values = [user_id, action, tokens_used, metadata];

    try {
      const result = await pool.query(query, values);
      return {
        success: true,
        rowCount: result.rowCount,
        row: result.rows?.[0] || null,
      };
    } catch (error) {
      console.error("PostgreSQL usage_logs INSERT failed:", {
        message: error?.message,
        code: error?.code,
        detail: error?.detail,
        hint: error?.hint,
        table: error?.table,
        constraint: error?.constraint,
      });
      throw error;
    }
  },
};

export default postgresService;
