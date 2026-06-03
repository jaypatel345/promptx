import { loadEnv } from "./config/env.js";
import MongoDB from "./config/db.js";
import PostgresDB from "./config/postgres.js";
import RedisClient from "./config/redis.js";
import aiJobQueue, { AI_JOB_QUEUE_NAME } from "./queues/aiJob.queue.js";
import { startWorkers, stopWorkers } from "./workers/index.js";

loadEnv();

const { default: app } = await import("../app.js");

const PORT = process.env.PORT || 1571;

let server = null;
let shuttingDown = false;

const logStartup = (level, event, meta = {}) => {
  const logger = level === "error" ? console.error : console.log;
  logger(
    JSON.stringify({
      level,
      event,
      service: "startup",
      timestamp: new Date().toISOString(),
      ...meta,
    }),
  );
};

const listen = () => {
  return new Promise((resolve, reject) => {
    const httpServer = app.listen(PORT, () => {
      logStartup("info", "api.started", {
        port: Number(PORT),
        environment: process.env.NODE_ENV || "development",
      });
      resolve(httpServer);
    });

    httpServer.on("error", reject);
  });
};

const closeServer = async () => {
  if (!server) {
    return;
  }

  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

  server = null;
  logStartup("info", "api.stopped");
};

const startRedis = async () => {
  RedisClient.getInstance();
  const ping = await RedisClient.ping(2000);

  if (!ping.ok) {
    throw new Error(`Redis connection failed: ${ping.reason || "ping_failed"}`);
  }

  logStartup("info", "redis.connected");
};

const shutdown = async (signal = "manual") => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  logStartup("info", "shutdown.started", { signal });

  try {
    await closeServer();
    await stopWorkers();
    await aiJobQueue.close();
    logStartup("info", "queue.closed", { queueName: AI_JOB_QUEUE_NAME });
    await RedisClient.close();
    await PostgresDB.close();
    await MongoDB.close();

    logStartup("info", "shutdown.completed", { signal });
    process.exit(0);
  } catch (error) {
    logStartup("error", "shutdown.failed", {
      signal,
      message: error?.message,
      stack: error?.stack,
    });
    process.exit(1);
  }
};

const cleanupAfterStartupFailure = async () => {
  await Promise.allSettled([
    closeServer(),
    stopWorkers(),
    aiJobQueue.close(),
    RedisClient.close(),
    PostgresDB.close(),
    MongoDB.close(),
  ]);
};

const startApplication = async () => {
  try {
    await MongoDB.connect();
    await PostgresDB.connect();
    await startRedis();
    await startWorkers();

    logStartup("info", "queues.processing", {
      queues: [AI_JOB_QUEUE_NAME],
    });

    server = await listen();
  } catch (error) {
    logStartup("error", "startup.failed", {
      message: error?.message,
      stack: error?.stack,
    });

    await cleanupAfterStartupFailure();
    process.exit(1);
  }
};

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("unhandledRejection", (reason) => {
  logStartup("error", "process.unhandled_rejection", {
    reason: reason?.message || String(reason),
  });
});

process.on("uncaughtException", (error) => {
  logStartup("error", "process.uncaught_exception", {
    message: error?.message,
    stack: error?.stack,
  });
  void shutdown("uncaughtException");
});

await startApplication();
