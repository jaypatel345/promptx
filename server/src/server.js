import { loadEnv } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { connectPostgres } from "./config/postgres.js";

loadEnv();

// NOTE: import app after env is loaded (ESM static imports are hoisted)
const { default: app } = await import("../app.js");

const PORT = process.env.PORT || 1571;

const startServer = async () => {
  try {
    // Connect MongoDB
    await connectDB();

    // Connect PostgreSQL
    await connectPostgres();

    // Start server ONLY ONCE
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Server startup failed:", {
      message: error?.message,
      stack: error?.stack,
    });
    process.exit(1);
  }
};

startServer();
