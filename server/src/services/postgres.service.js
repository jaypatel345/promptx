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
};

export default postgresService;
