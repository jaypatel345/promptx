import { messageService } from "./message.service.js";
import { aiService } from "./ai.service.js";
import { conversationRepository } from "../repositories/conversation.repository.js";
import postgresService from "./postgres.service.js";
import ApiError from "../utils/ApiError.js";

export const chatService = {
  sendMessage: async (req) => {
    const { conversationId, content } = req.body;
    const attachments = req.files || [];
    const start = Date.now();

    // -------------------------
    // 1. Validate input
    // -------------------------
    if (!conversationId || !content) {
      throw new ApiError(400, "conversationId and content are required");
    }

    // -------------------------
    // 2. Validate conversation access
    // -------------------------
    const exists = await conversationRepository.exists({
      _id: conversationId,
      ...(req.user ? { userId: req.user._id } : { guestId: req.query.guestId }),
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

    // -------------------------
    // 4. Call AI
    // -------------------------
    const aiResponse = await aiService.enhancePrompt({
      message: content,
      files: attachments,
    });

    // -------------------------
    // 5. Save AI message (Mongo)
    // -------------------------
    const aiMessage = await messageService.createMessage({
      conversationId,
      role: "assistant",
      content: aiResponse.content,
      attachments: [],
    });

    // -------------------------
    // 6. Save prompt_history (Postgres)
    // -------------------------
    const userId = req.user?._id || req.query.guestId;

    if (userId) {
      const payload = {
        user_id: userId,
        prompt: content,
        response: aiResponse.content,
        model: process.env.GROQ_MODEL || "llama-3",
      };

      if (process.env.POSTGRES_DEBUG === "1") {
        console.log("PostgreSQL prompt_history payload:", {
          user_id: payload.user_id,
          model: payload.model,
          prompt_len: String(payload.prompt || "").length,
          response_len: String(payload.response || "").length,
        });
      }

      try {
        const pgResult = await postgresService.savePromptHistory(payload);
        if (process.env.POSTGRES_DEBUG === "1") {
          console.log("PostgreSQL prompt_history insert:", pgResult);
        }
      } catch (err) {
        console.error("FULL Postgres error:", err); // log full error
        // Fail-fast in production by default so you don't silently lose data.
        // Set POSTGRES_REQUIRED=0 if you want to allow chat responses even when history write fails.
        if (
          process.env.POSTGRES_REQUIRED !== "0" &&
          process.env.NODE_ENV === "production"
        ) {
          throw err;
        }
      }
    }
    // -------------------------
    // 7. Usage_Log
    // -------------------------
    const tokenUsed = aiResponse.usage?.total_tokens || 0;
    try {
      const Usage_log = await postgresService.saveUsageLog({
        user_id: userId,
        action: "chat",
        tokens_used: tokenUsed,
        metadata: {
          model: process.env.GROQ_MODEL || "llama-3",
          latency_ms: Date.now() - start,
          status: "success",
        },
      });
      console.log("PostgreSQL Usage_log insert:", Usage_log);
    } catch (err) {
      console.error("Usage log failed:", err);
    }

    // -------------------------
    // 8. Return response
    // -------------------------
    return {
      success: true,
      data: {
        userMessage: userMessage.message,
        aiMessage: aiMessage.message,
      },
    };
  },
};
