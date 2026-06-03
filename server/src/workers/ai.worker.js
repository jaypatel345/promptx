import { Worker } from "bullmq";
import { getBullMQConnection } from "../config/bullmq.js";
import { AI_JOB_QUEUE_NAME } from "../queues/aiJob.queue.js";
import {
  getAiJobId,
  updateAiJobStatus,
} from "../repositories/aiJob.repository.js";
import { messageService } from "../services/message.service.js";
import { aiService } from "../services/ai.service.js";
import postgresService from "../services/postgres.service.js";

const logWorkerEvent = (level, event, meta = {}) => {
  const logger = level === "error" ? console.error : console.log;
  logger(
    JSON.stringify({
      level,
      event,
      service: "ai-worker",
      timestamp: new Date().toISOString(),
      ...meta,
    }),
  );
};

const processAiJob = async (job) => {
  const { aiJobId, requestId } = job.data;

  logWorkerEvent("info", "worker.job.received", {
    requestId,
    queueJobId: job.id,
    aiJobId,
    data: job.data,
  });

  const aiJob = await getAiJobId(aiJobId);

  if (!aiJob) {
    logWorkerEvent("error", "worker.ai_job.not_found", {
      requestId,
      queueJobId: job.id,
      aiJobId,
    });
    throw new Error(`AI job not found: ${aiJobId}`);
  }

  logWorkerEvent("info", "worker.ai_job.loaded", {
    requestId,
    queueJobId: job.id,
    aiJobId: aiJob._id?.toString(),
    conversationId: aiJob.conversationId?.toString(),
    userMessageId: aiJob.userMessageId?.toString(),
    status: aiJob.status,
  });

  const updatedJob = await updateAiJobStatus(aiJobId, "processing", {
    startedAt: new Date(),
  });

  logWorkerEvent("info", "worker.ai_job.processing", {
    requestId,
    queueJobId: job.id,
    aiJobId,
    status: updatedJob?.status,
  });

  const userMessage = await messageService.getMessageById(
    aiJob.userMessageId,
    aiJob.conversationId,
  );

  logWorkerEvent("info", "worker.user_message.loaded", {
    requestId,
    queueJobId: job.id,
    aiJobId,
    userMessageId: userMessage?._id?.toString(),
    contentLength: String(userMessage?.content || "").length,
    attachmentCount: userMessage?.attachments?.length || 0,
  });

  const aiResponse = await aiService.enhancePrompt({
    message: userMessage.content,
    files: userMessage.attachments,
  });

  const aiMessage = await messageService.createMessage({
    conversationId: aiJob.conversationId,
    role: "assistant",
    content: aiResponse.content,
    attachments: [],
  });

  logWorkerEvent("info", "worker.assistant_message.created", {
    requestId,
    queueJobId: job.id,
    aiJobId,
    assistantMessageId: aiMessage?.message?._id?.toString(),
  });

  const historyUserId = aiJob.userId || aiJob.guestId || null;

  if (historyUserId) {
    const payload = {
      user_id: historyUserId,
      prompt: userMessage.content,
      response: aiResponse.content,
      model: process.env.GROQ_MODEL || "llama-3",
    };

    try {
      logWorkerEvent("info", "worker.prompt_history.saving", {
        requestId,
        queueJobId: job.id,
        aiJobId,
        userId: aiJob.userId || null,
        guestId: aiJob.guestId || null,
        historyUserId,
        promptLength: payload.prompt.length,
        responseLength: payload.response.length,
        model: payload.model,
      });

      const pgResult = await postgresService.savePromptHistory(payload);

      logWorkerEvent("info", "worker.prompt_history.saved", {
        requestId,
        queueJobId: job.id,
        aiJobId,
        pgResult,
      });
    } catch (err) {
      logWorkerEvent("error", "worker.prompt_history.failed", {
        requestId,
        queueJobId: job.id,
        aiJobId,
        error: err.message,
      });

      if (
        process.env.POSTGRES_REQUIRED !== "0" &&
        process.env.NODE_ENV === "production"
      ) {
        throw err;
      }
    }
  } else {
    logWorkerEvent("warn", "worker.prompt_history.skipped", {
      requestId,
      queueJobId: job.id,
      aiJobId,
      reason: "missing userId and guestId",
    });
  }

  const completedJob = await updateAiJobStatus(aiJobId, "completed", {
    completedAt: new Date(),
  });

  logWorkerEvent("info", "worker.ai_job.completed", {
    requestId,
    queueJobId: job.id,
    aiJobId,
    status: completedJob?.status,
  });
};

export const createAiWorker = () => {
  const worker = new Worker(AI_JOB_QUEUE_NAME, processAiJob, {
    connection: getBullMQConnection(),
  });

  worker.on("ready", () => {
    logWorkerEvent("info", "worker.started", {
      queueName: AI_JOB_QUEUE_NAME,
    });
  });

  worker.on("failed", async (job, err) => {
    const aiJobId = job?.data?.aiJobId;
    const requestId = job?.data?.requestId;

    logWorkerEvent("error", "worker.job.failed", {
      requestId,
      queueJobId: job?.id,
      aiJobId,
      error: err.message,
    });

    if (aiJobId) {
      await updateAiJobStatus(aiJobId, "failed", {
        error: err.message,
        completedAt: new Date(),
      });
    }
  });

  worker.on("error", (err) => {
    logWorkerEvent("error", "worker.error", {
      queueName: AI_JOB_QUEUE_NAME,
      error: err.message,
    });
  });

  return worker;
};

