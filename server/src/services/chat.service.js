import { messageService } from "./message.service.js";
import { conversationRepository } from "../repositories/conversation.repository.js";
import ApiError from "../utils/ApiError.js";
import aiJobModel from "../models/aiJob.model.js";
import aiJobQueue from "../queues/aiJob.queue.js";
import mongoose from "mongoose";

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
    const conversationId = String(firstValue(req.body?.conversationId) || "").trim();
    const content = String(firstValue(req.body?.content) || "").trim();
    const attachments = req.files || [];
    const requestId = req.requestId;
    const userId = req.user?._id?.toString();
    const guestId = firstValue(req.query?.guestId);

    // -------------------------
    // 1. Validate input
    // -------------------------
    logChatEvent("info", "chat.send.received", {
      requestId,
      contentType: req.headers["content-type"],
      hasJsonBody: Boolean(req.body),
      bodyKeys: Object.keys(req.body || {}),
      conversationId,
      conversationIdValid: mongoose.Types.ObjectId.isValid(conversationId),
      contentLength: content.length,
      attachmentCount: attachments.length,
      fileFields: attachments.map((file) => file.fieldname),
      userId,
      guestId,
    });

    if (!conversationId) {
      throw new ApiError(400, "conversationId is required");
    }

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      throw new ApiError(400, "conversationId must be a valid MongoDB ObjectId");
    }

    if (!content) {
      throw new ApiError(400, "conversationId and content are required");
    }

    // -------------------------
    // 2. Validate conversation access
    // -------------------------
    const exists = await conversationRepository.exists({
      _id: conversationId,
      ...(req.user ? { userId: req.user._id } : { guestId }),
    });

    if (!exists) {
      throw new ApiError(404, "Conversation not found");
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

    // -------------------------
    // 8. Return response
    // -------------------------
    return {
      success: true,
      data: {
        userMessage: userMessageDoc,
        aiJobId: aiJob._id,
      },
    };
  },
};
