import { messageRepository } from "../repositories/message.repository.js";
import { conversationRepository } from "../repositories/conversation.repository.js";
import ApiError from "../utils/ApiError.js";
import mongoose from "mongoose";

const logMessageEvent = (level, event, meta = {}) => {
  const logger = level === "error" ? console.error : console.log;
  logger(
    JSON.stringify({
      level,
      event,
      service: "message-service",
      timestamp: new Date().toISOString(),
      ...meta,
    }),
  );
};

export const messageService = {
  getMessages: async (req) => {
    const { conversationId } = req.params;
    const { lastSeen } = req.params;
    const guestId = req.query?.guestId;
    const userId = req.user?._id?.toString();

    if (!conversationId) {
      throw new ApiError(400, "conversationId is required");
    }

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      throw new ApiError(400, "conversationId must be a valid MongoDB ObjectId");
    }

    if (!userId && !guestId) {
      throw new ApiError(401, "Missing guestId or login token");
    }

    const conversationQuery = {
      _id: conversationId,
      ...(userId ? { userId } : { guestId }),
    };

    logMessageEvent("info", "messages.fetch.query", {
      requestId: req.requestId,
      conversationId,
      userId,
      guestId,
      query: conversationQuery,
    });

    const exists = await conversationRepository.exists(conversationQuery);

    if (!exists) {
      logMessageEvent("error", "messages.fetch.conversation_not_found", {
        requestId: req.requestId,
        conversationId,
        userId,
        guestId,
        query: conversationQuery,
      });
      throw new ApiError(404, "Conversation not found");
    }

    const query = {
      conversationId,
      ...(lastSeen && { createdAt: { $gt: new Date(lastSeen) } }),
    };

    return messageRepository.findByConversation(query);
  },

  getMessageById: async (
    messageId,
    conversationId,
  ) => {
    if (!messageId || !conversationId) {
      throw new ApiError(
        400,
        "messageId and conversationId are required",
      );
    }

    const message = await messageRepository.findByIdAndConversation(
      messageId,
      conversationId,
    );

    if (!message) {
      throw new ApiError(404, "Message not found");
    }

    return message;
  },
  
  createMessage: async (reqOrPayload) => {
    const body =
      reqOrPayload && typeof reqOrPayload === "object" && "body" in reqOrPayload
        ? reqOrPayload.body
        : reqOrPayload;

    const { conversationId, role, content, attachments } = body || {};

    if (!conversationId || !role || !content) {
      throw new ApiError(400, "Missing required fields");
    }

    // 1. Save message
    const newMessage = await messageRepository.create({
      conversationId,
      role,
      content,
      attachments: attachments || [],
    });

    // 2. Business logic → auto title
    if (role === "user") {
      const conversation =
        await conversationRepository.findById(conversationId);

      if (
        conversation &&
        (!conversation.title || conversation.title === "New Chat")
      ) {
        conversation.title = content.split(" ").slice(0, 6).join(" ");
        await conversationRepository.save(conversation);
      }
    }

    //  FUTURE (don’t add yet)
    // await postgresService.savePrompt(...)
    // await usageService.track(...)

    return { message: newMessage };
  },
};
