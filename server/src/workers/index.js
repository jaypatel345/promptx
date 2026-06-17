import { QueueEvents } from "bullmq";
import { getBullMQConnection } from "../config/bullmq.js";
import RedisClient from "../config/redis.js";
import { AI_JOB_QUEUE_NAME } from "../queues/aiJob.queue.js";
import { createAiWorker } from "./ai.worker.js";

let workerRuntime = null;

const LOCAL_DEV_LOCK_KEY = `promptx:local-dev:worker-lock:${AI_JOB_QUEUE_NAME}`;
const LOCAL_DEV_LOCK_TTL_SECONDS = 15;
const LOCAL_DEV_LOCK_REFRESH_MS = 5000;

const isLocalDevelopment = () => process.env.NODE_ENV !== "production";
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const parseLockHolder = (holder) => {
  try {
    return JSON.parse(holder);
  } catch {
    return null;
  }
};

const isProcessAlive = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

const logWorkerBootstrap = (level, event, meta = {}) => {
  const logger = level === "error" ? console.error : console.log;
  logger(
    JSON.stringify({
      level,
      event,
      service: "worker-bootstrap",
      timestamp: new Date().toISOString(),
      ...meta,
    }),
  );
};

const releaseStaleLocalDevLock = async (holder) => {
  const holderInfo = parseLockHolder(holder);
  const holderPid = Number(holderInfo?.pid);

  if (!holderInfo || !holderPid) {
    await RedisClient.del(LOCAL_DEV_LOCK_KEY);
    logWorkerBootstrap("warn", "local_worker_lock.invalid_cleared", {
      queueName: AI_JOB_QUEUE_NAME,
      pid: process.pid,
      lockKey: LOCAL_DEV_LOCK_KEY,
      holder,
    });
    return true;
  }

  if (holderPid === process.pid) {
    return false;
  }

  if (isProcessAlive(holderPid)) {
    logWorkerBootstrap("warn", "local_worker_lock.terminating_holder", {
      queueName: AI_JOB_QUEUE_NAME,
      pid: process.pid,
      holderPid,
      holderStartedAt: holderInfo.startedAt,
      holderEntrypoint: holderInfo.entrypoint,
    });

    try {
      process.kill(holderPid, "SIGTERM");
      await wait(750);

      if (isProcessAlive(holderPid)) {
        process.kill(holderPid, "SIGKILL");
      }
    } catch (error) {
      logWorkerBootstrap("warn", "local_worker_lock.holder_terminate_failed", {
        queueName: AI_JOB_QUEUE_NAME,
        pid: process.pid,
        holderPid,
        message: error?.message,
      });
    }
  }

  const currentHolder = await RedisClient.get(LOCAL_DEV_LOCK_KEY);

  if (currentHolder === holder) {
    await RedisClient.del(LOCAL_DEV_LOCK_KEY);
    logWorkerBootstrap("warn", "local_worker_lock.stale_cleared", {
      queueName: AI_JOB_QUEUE_NAME,
      pid: process.pid,
      lockKey: LOCAL_DEV_LOCK_KEY,
      holderPid,
      holderStartedAt: holderInfo.startedAt,
    });
    return true;
  }

  return false;
};

const acquireLocalDevWorkerLock = async () => {
  if (!isLocalDevelopment()) {
    return null;
  }

  const token = JSON.stringify({
    pid: process.pid,
    queueName: AI_JOB_QUEUE_NAME,
    startedAt: new Date().toISOString(),
    entrypoint: process.argv[1],
  });
  let acquired = await RedisClient.set(
    LOCAL_DEV_LOCK_KEY,
    token,
    "NX",
    "EX",
    LOCAL_DEV_LOCK_TTL_SECONDS,
  );

  if (acquired !== "OK") {
    const holder = await RedisClient.get(LOCAL_DEV_LOCK_KEY);
    const released = await releaseStaleLocalDevLock(holder);

    if (released) {
      acquired = await RedisClient.set(
        LOCAL_DEV_LOCK_KEY,
        token,
        "NX",
        "EX",
        LOCAL_DEV_LOCK_TTL_SECONDS,
      );
    }
  }

  if (acquired !== "OK") {
    const holder = await RedisClient.get(LOCAL_DEV_LOCK_KEY);
    throw new Error(
      `Local development worker already exists for ${AI_JOB_QUEUE_NAME}. ` +
        `Stop the stale process or wait ${LOCAL_DEV_LOCK_TTL_SECONDS}s for the lock to expire. Holder: ${holder}`,
    );
  }

  logWorkerBootstrap("info", "local_worker_lock.acquired", {
    queueName: AI_JOB_QUEUE_NAME,
    pid: process.pid,
    lockKey: LOCAL_DEV_LOCK_KEY,
    ttlSeconds: LOCAL_DEV_LOCK_TTL_SECONDS,
  });

  const heartbeat = setInterval(async () => {
    try {
      const holder = await RedisClient.get(LOCAL_DEV_LOCK_KEY);

      if (holder !== token) {
        logWorkerBootstrap("error", "local_worker_lock.lost", {
          queueName: AI_JOB_QUEUE_NAME,
          pid: process.pid,
          lockKey: LOCAL_DEV_LOCK_KEY,
          holder,
        });
        void stopWorkers();
        return;
      }

      await RedisClient.set(
        LOCAL_DEV_LOCK_KEY,
        token,
        "XX",
        "EX",
        LOCAL_DEV_LOCK_TTL_SECONDS,
      );
    } catch (error) {
      logWorkerBootstrap("error", "local_worker_lock.refresh_failed", {
        queueName: AI_JOB_QUEUE_NAME,
        pid: process.pid,
        lockKey: LOCAL_DEV_LOCK_KEY,
        message: error?.message,
      });
    }
  }, LOCAL_DEV_LOCK_REFRESH_MS);

  heartbeat.unref?.();

  return {
    token,
    heartbeat,
    async release() {
      clearInterval(heartbeat);

      const holder = await RedisClient.get(LOCAL_DEV_LOCK_KEY);
      if (holder === token) {
        await RedisClient.del(LOCAL_DEV_LOCK_KEY);
        logWorkerBootstrap("info", "local_worker_lock.released", {
          queueName: AI_JOB_QUEUE_NAME,
          pid: process.pid,
          lockKey: LOCAL_DEV_LOCK_KEY,
        });
      }
    },
  };
};

export const startWorkers = async () => {
  if (workerRuntime) {
    logWorkerBootstrap("info", "workers.already_started", {
      queues: workerRuntime.queueNames,
    });
    return workerRuntime;
  }

  const localDevLock = await acquireLocalDevWorkerLock();
  const queueEvents = new QueueEvents(AI_JOB_QUEUE_NAME, {
    connection: getBullMQConnection(),
  });
  const aiWorker = createAiWorker();

  try {
    await queueEvents.waitUntilReady();
    await aiWorker.waitUntilReady();
  } catch (error) {
    await Promise.allSettled([aiWorker.close(), queueEvents.close()]);
    await localDevLock?.release();
    throw error;
  }

  workerRuntime = {
    workers: [aiWorker],
    queueEvents: [queueEvents],
    queueNames: [AI_JOB_QUEUE_NAME],
    localDevLock,
  };

  logWorkerBootstrap("info", "workers.started", {
    queues: workerRuntime.queueNames,
  });

  return workerRuntime;
};

export const stopWorkers = async () => {
  if (!workerRuntime) {
    return;
  }

  const runtime = workerRuntime;
  workerRuntime = null;

  await Promise.all(runtime.workers.map((worker) => worker.close()));
  await Promise.all(runtime.queueEvents.map((queueEvent) => queueEvent.close()));
  await runtime.localDevLock?.release();

  logWorkerBootstrap("info", "workers.stopped", {
    queues: runtime.queueNames,
  });
};
