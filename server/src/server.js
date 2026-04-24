import app from "../app.js";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { connectPostgres } from "./config/postgres.js";

// Load env
dotenv.config({
  path: process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development",
});

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
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();