import { loadEnv } from "./config/env.js";
import MongoDB from "./config/db.js";
import PostgresDB from "./config/postgres.js";
import RedisClient from "./config/redis.js";
import aiJobQueue, { AI_JOB_QUEUE_NAME } from "./queues/aiJob.queue.js";
import { startWorkers, stopWorkers } from "./workers/index.js";

loadEnv();

if (process.env.NODE_ENV !== "production") {
  console.log(
    JSON.stringify({
      level: "warn",
      event: "standalone_worker.disabled_in_development",
      service: "worker-process",
      timestamp: new Date().toISOString(),
      pid: process.pid,
      nodeEnv: process.env.NODE_ENV || "undefined",
      message:
        "Local development uses the API server worker started from src/index.js. Standalone worker.js is disabled.",
    }),
  );
  process.exit(0);
}

let shuttingDown = false;

const logWorkerProcess = (level, event, meta = {}) => {
  const logger = level === "error" ? console.error : console.log;
  logger(
    JSON.stringify({
      level,
      event,
      service: "worker-process",
      timestamp: new Date().toISOString(),
      ...meta,
    }),
  );
};

const shutdown = async (signal = "manual") => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  try {
    await stopWorkers();
    await aiJobQueue.close();
    await RedisClient.close();
    await PostgresDB.close();
    await MongoDB.close();
    logWorkerProcess("info", "shutdown.completed", { signal });
    process.exit(0);
  } catch (error) {
    logWorkerProcess("error", "shutdown.failed", {
      signal,
      message: error?.message,
      stack: error?.stack,
    });
    process.exit(1);
  }
};

try {
  await MongoDB.connect();
  await PostgresDB.connect();
  RedisClient.getInstance();

  const ping = await RedisClient.ping(2000);
  if (!ping.ok) {
    throw new Error(`Redis connection failed: ${ping.reason || "ping_failed"}`);
  }

  await startWorkers();

  logWorkerProcess("info", "standalone_worker.started", {
    queues: [AI_JOB_QUEUE_NAME],
  });
} catch (error) {
  logWorkerProcess("error", "standalone_worker.failed", {
    message: error?.message,
    stack: error?.stack,
  });
  await shutdown("startup_failure");
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});
