import { getPool } from "../config/postgres.js";

const postgresService = {
  savePromptHistory: async ({ user_id, prompt, response, model }) => {
    const pool = getPool();
    if (!pool) return { skipped: true };

    const query = `
      INSERT INTO prompt_history (user_id, prompt, response, model)
      VALUES ($1, $2, $3, $4)
    `;

    await pool.query(query, [user_id, prompt, response, model]);
    return { success: true };
  },
};

export default postgresService;

