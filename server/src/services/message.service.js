import { messageRepository } from "../repositories/message.repository.js";
import { conversationRepository } from "../repositories/conversation.repository.js";
import ApiError from "../utils/ApiError.js";

export const messageService = {
  getMessages: async (req) => {
    const { conversationId } = req.params;
    const { lastSeen } = req.params;

    if (!conversationId) {
      throw new ApiError(400, "conversationId is required");
    }

    const exists = await conversationRepository.exists({
      _id: conversationId,
      ...(req.user
        ? { userId: req.user._id }
        : { guestId: req.query.guestId }),
    });

    if (!exists) {
      throw new ApiError(404, "Conversation not found");
    }

    const query = {
      conversationId,
      ...(lastSeen && { createdAt: { $gt: new Date(lastSeen) } }),
    };

    return messageRepository.findByConversation(query);
  },

  createMessage: async (req) => {
    const { conversationId, role, content, attachments } = req.body;

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
        await conversationRepository.update(conversation);
      }
    }

    //  FUTURE (don’t add yet)
    // await postgresService.savePrompt(...)
    // await usageService.track(...)

    return { message: newMessage };
  },
};