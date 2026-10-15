import { messageService } from "./message.service.js";
import { conversationRepository } from "../repositories/conversation.repository.js";
import ApiError from "../utils/ApiError.js";
import aiJobModel from "../models/aiJob.model.js";
import aiJobQueue from "../queues/aiJob.queue.js";
import {
  getAiJobId,
  cancelAiJobIfActive,
} from "../repositories/aiJob.repository.js";
import mongoose from "mongoose";
import { resolveModel } from "../config/models.js";
import { resolveTargetModel } from "../prompts/targetModelStyles.js";

const firstValue = (value) => (Array.isArray(value) ? value[0] : value);

const logChatEvent = (level, event, meta = {}) => {
  const logger = level === "error" ? console.error : console.log;
  logger(
    JSON.stringify({
      level,
      event,
      service: "chat-service",
      timestamp: new Date().toISOString(),
      ...meta,
    }),
  );
};

export const chatService = {
  sendMessage: async (req) => {
    let conversationId = String(firstValue(req.body?.conversationId) || "").trim();
    const content = String(firstValue(req.body?.content) || "").trim();
    const attachments = req.files || [];
    const requestId = req.requestId;
    const userId = req.user?._id?.toString();
    const guestId = firstValue(req.query?.guestId);
    const model = resolveModel(firstValue(req.body?.model));
    const targetModel = resolveTargetModel(firstValue(req.body?.targetModel));

    // -------------------------
    // 1. Validate input
    // -------------------------
    logChatEvent("info", "chat.send.received", {
      requestId,
      contentType: req.headers["content-type"],
      hasJsonBody: Boolean(req.body),
      bodyKeys: Object.keys(req.body || {}),
      conversationId,
      contentLength: content.length,
      attachmentCount: attachments.length,
      fileFields: attachments.map((file) => file.fieldname),
      userId,
      guestId,
      model,
      targetModel,
    });

    if (!content) {
      throw new ApiError(400, "content is required");
    }

    if (conversationId && !mongoose.Types.ObjectId.isValid(conversationId)) {
      conversationId = null;
    }

    // -------------------------
    // 2. Resolve the conversation
    // -------------------------
    // A brand-new chat arrives with no conversationId at all — creating it
    // here (instead of a separate POST /conversations the client awaits
    // first) saves a full extra network round trip before the message can
    // even be queued, which is what made a new user's first message feel
    // slow in production.
    if (!conversationId) {
      if (!userId && !guestId) {
        throw new ApiError(400, "Missing guestId or login token");
      }

      const conversation = await conversationRepository.create({
        title: content.slice(0, 30),
        userId: userId || null,
        guestId: userId ? null : guestId,
      });

      conversationId = conversation._id.toString();
    } else {
      const exists = await conversationRepository.exists({
        _id: conversationId,
        ...(req.user ? { userId: req.user._id } : { guestId }),
      });

      if (!exists) {
        throw new ApiError(404, "Conversation not found");
      }
    }

    // -------------------------
    // 3. Save USER message (Mongo)
    // -------------------------
    const userMessage = await messageService.createMessage({
      conversationId,
      role: "user",
      content,
      attachments,
    });

    const userMessageDoc = userMessage?.message || userMessage;
    const userMessageId = userMessageDoc?._id?.toString();

    logChatEvent("info", "chat.user_message.created", {
      requestId,
      conversationId,
      userMessageWrapperKeys: Object.keys(userMessage || {}),
      userMessageId,
      userMessageIdValid: Boolean(userMessageId && mongoose.Types.ObjectId.isValid(userMessageId)),
    });

    if (!userMessageId) {
      logChatEvent("error", "chat.user_message.missing_id", {
        requestId,
        conversationId,
        userMessage,
      });
      throw new ApiError(500, "User message was created without an _id");
    }

    if (!mongoose.Types.ObjectId.isValid(userMessageId)) {
      throw new ApiError(500, "User message _id is not a valid MongoDB ObjectId");
    }


    // // -------------------------
    // // 4. Call AI
    // // -------------------------
    // const aiResponse = await aiService.enhancePrompt({
    //   message: content,
    //   files: attachments,
    // });

    // // -------------------------
    // // 5. Save AI message (Mongo)
    // // -------------------------
    // const aiMessage = await messageService.createMessage({
    //   conversationId,
    //   role: "assistant",
    //   content: aiResponse.content,
    //   attachments: [],
    // });

    // // -------------------------
    // // 6. Save prompt_history (Postgres)
    // // -------------------------
    // const userId = req.user?._id || req.query.guestId;

    // if (userId) {
    //   const payload = {
    //     user_id: userId,
    //     prompt: content,
    //     response: aiResponse.content,
    //     model: process.env.GROQ_MODEL || "llama-3",
    //   };

    //   if (process.env.POSTGRES_DEBUG === "1") {
    //     console.log("PostgreSQL prompt_history payload:", {
    //       user_id: payload.user_id,
    //       model: payload.model,
    //       prompt_len: String(payload.prompt || "").length,
    //       response_len: String(payload.response || "").length,
    //     });
    //   }

    //   try {
    //     const pgResult = await postgresService.savePromptHistory(payload);
    //     if (process.env.POSTGRES_DEBUG === "1") {
    //       console.log("PostgreSQL prompt_history insert:", pgResult);
    //     }
    //   } catch (err) {
    //     console.error("FULL Postgres error:", err); // log full error
    //     // Fail-fast in production by default so you don't silently lose data.
    //     // Set POSTGRES_REQUIRED=0 if you want to allow chat responses even when history write fails.
    //     if (
    //       process.env.POSTGRES_REQUIRED !== "0" &&
    //       process.env.NODE_ENV === "production"
    //     ) {
    //       throw err;
    //     }
    //   }
    // }
    // // -------------------------
    // // 7. Usage_Log
    // // -------------------------
    // const tokenUsed = aiResponse.usage?.total_tokens || 0;
    // try {
    //   const Usage_log = await postgresService.saveUsageLog({
    //     user_id: userId,
    //     action: "chat",
    //     tokens_used: tokenUsed,
    //     metadata: {
    //       model: process.env.GROQ_MODEL || "llama-3",
    //       latency_ms: Date.now() - start,
    //       status: "success",
    //     },
    //   });
    //   console.log("PostgreSQL Usage_log insert:", Usage_log);
    // } catch (err) {
    //   console.error("Usage log failed:", err);
    // }

    // -------------------------
    // 4. Create Job
    // -------------------------
    const aiJobPayload = {
      conversationId,
      userMessageId,
      requestId,
      userId: userId || null,
      guestId: guestId || null,
      model,
      targetModel,
      status: "pending",
    };

    logChatEvent("info", "chat.ai_job.create_payload", {
      requestId,
      modelName: aiJobModel.modelName,
      collectionName: aiJobModel.collection.name,
      payload: aiJobPayload,
    });

    const aiJobForValidation = new aiJobModel(aiJobPayload);
    const validationError = aiJobForValidation.validateSync();

    if (validationError) {
      logChatEvent("error", "chat.ai_job.validation_failed", {
        requestId,
        errors: Object.fromEntries(
          Object.entries(validationError.errors).map(([field, error]) => [
            field,
            error.message,
          ]),
        ),
        payload: aiJobPayload,
      });
      throw validationError;
    }

    const aiJob = await aiJobModel.create(aiJobPayload);

    logChatEvent("info", "chat.ai_job.created", {
      requestId,
      aiJobId: aiJob._id?.toString(),
      conversationId: aiJob.conversationId?.toString(),
      userMessageId: aiJob.userMessageId?.toString(),
      status: aiJob.status,
    });

    // -------------------------
    // 5. Push Queue Job
    // -------------------------
    const queueJob = await aiJobQueue.add("process-ai-job", {
      aiJobId: aiJob._id.toString(),
      requestId,
      conversationId,
      userMessageId,
    });

    logChatEvent("info", "chat.ai_job.enqueued", {
      requestId,
      queueJobId: queueJob.id,
      aiJobId: aiJob._id?.toString(),
    });

    aiJob.queueJobId = String(queueJob.id);
    await aiJob.save();

    // -------------------------
    // 8. Return response
    // -------------------------
    return {
      success: true,
      data: {
        conversationId,
        userMessage: userMessageDoc,
        aiJobId: aiJob._id,
        model,
        targetModel,
      },
    };
  },

  cancelJob: async (req) => {
    const aiJobId = String(firstValue(req.params?.aiJobId) || "").trim();
    const requestId = req.requestId;
    const userId = req.user?._id?.toString();
    const guestId = firstValue(req.query?.guestId);

    if (!aiJobId || !mongoose.Types.ObjectId.isValid(aiJobId)) {
      throw new ApiError(400, "aiJobId must be a valid MongoDB ObjectId");
    }

    const aiJob = await getAiJobId(aiJobId);

    if (!aiJob) {
      throw new ApiError(404, "AI job not found");
    }

    const ownedByRequester = req.user
      ? aiJob.userId === userId
      : Boolean(guestId) && aiJob.guestId === guestId;

    if (!ownedByRequester) {
      throw new ApiError(404, "AI job not found");
    }

    const cancelled = await cancelAiJobIfActive(aiJobId);

    logChatEvent("info", "chat.ai_job.cancel_requested", {
      requestId,
      aiJobId,
      cancelled: Boolean(cancelled),
      statusBefore: aiJob.status,
    });

    // Best-effort: drop it from the queue if it hasn't started running yet.
    // If it's already "processing", the worker itself polls aiJob.status and
    // aborts the in-flight AI request when it sees "cancelled".
    if (cancelled && aiJob.queueJobId) {
      try {
        const queueJob = await aiJobQueue.getJob(aiJob.queueJobId);
        if (queueJob) {
          const state = await queueJob.getState();
          if (state === "waiting" || state === "delayed") {
            await queueJob.remove();
          }
        }
      } catch (err) {
        logChatEvent("error", "chat.ai_job.queue_remove_failed", {
          requestId,
          aiJobId,
          error: err.message,
        });
      }
    }

    return {
      success: true,
      data: {
        aiJobId,
        status: cancelled?.status || aiJob.status,
      },
    };
  },
};
