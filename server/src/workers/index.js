import { QueueEvents } from "bullmq";
import { getBullMQConnection } from "../config/bullmq.js";
import { AI_JOB_QUEUE_NAME } from "../queues/aiJob.queue.js";
import { createAiWorker } from "./ai.worker.js";

let workerRuntime = null;

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

export const startWorkers = async () => {
  if (workerRuntime) {
    logWorkerBootstrap("info", "workers.already_started", {
      queues: workerRuntime.queueNames,
    });
    return workerRuntime;
  }

  const queueEvents = new QueueEvents(AI_JOB_QUEUE_NAME, {
    connection: getBullMQConnection(),
  });
  const aiWorker = createAiWorker();

  try {
    await queueEvents.waitUntilReady();
    await aiWorker.waitUntilReady();
  } catch (error) {
    await Promise.allSettled([aiWorker.close(), queueEvents.close()]);
    throw error;
  }

  workerRuntime = {
    workers: [aiWorker],
    queueEvents: [queueEvents],
    queueNames: [AI_JOB_QUEUE_NAME],
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

  logWorkerBootstrap("info", "workers.stopped", {
    queues: runtime.queueNames,
  });
};
