import express from "express";
import mongoose from "mongoose";
import redisClient, { pingRedis } from "../config/redis.js";
import { getPool } from "../config/postgres.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // MongoDB check
    const mongoConnected = mongoose.connection.readyState === 1;

    // PostgreSQL check
    let postgresConnected = false;
    try {
      const pool = getPool();
      const pgResult = await pool.query("SELECT 1");
      postgresConnected = Boolean(pgResult);
    } catch {
      postgresConnected = false;
    }

    // Redis check (ioredis doesn't expose `isReady` like node-redis does)
    let redisConnected = false;
    let redisState = "disconnected";
    try {
      if (!redisClient) {
        redisState = "disabled";
      } else {
        const ping = await pingRedis(500);
        redisConnected = ping.ok;
        redisState = ping.ok ? "connected" : "disconnected";
      }
    } catch {
      redisConnected = false;
      redisState = "disconnected";
    }

    // Overall system status
    // Treat MongoDB + PostgreSQL as "core" (required for API to function).
    // Redis can be optional depending on deployment, so don't fail health solely on Redis.
    const coreHealthy = mongoConnected && postgresConnected;
    const allHealthy = coreHealthy && redisConnected;

    const statusCode = coreHealthy ? 200 : 503;

    return res.status(statusCode).json({
      success: coreHealthy,
      status: coreHealthy ? (allHealthy ? "OK" : "DEGRADED") : "DOWN",

      services: {
        mongodb: mongoConnected ? "connected" : "disconnected",

        postgresql: postgresConnected
          ? "connected"
          : "disconnected",

        redis: redisState,
      },

      uptime: process.uptime(),

      timestamp: new Date().toISOString(),

      environment: process.env.NODE_ENV,

      requestId: req.requestId,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      status: "ERROR",

      error: error.message,

      requestId: req.requestId,
    });
  }
});

export default router;
