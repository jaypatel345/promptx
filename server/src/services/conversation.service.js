import ApiError from "../utils/ApiError.js";
import { conversationRepository } from "../repositories/conversation.repository.js";

export const conversationService = {
  createConversation: async (req) => {
    const { title, guestId } = req.body;
    const userId = req.user?.id || null;

    if (!userId && !guestId) {
      throw new ApiError(400, "Missing guestId or login token");
    }

    const conversation = await conversationRepository.create({
      title: title || "New Chat",
      userId: userId || null,
      guestId: userId ? null : guestId,
    });

    return { conversationId: conversation._id };
  },

  listConversations: async (req) => {
    const { guestId } = req.query;
    const userId = req.user?.id;

    const query = userId ? { userId } : guestId ? { guestId } : null;

    if (!query) {
      throw new ApiError(401, "Unauthorized");
    }

    const conversations = await conversationRepository.find(query);

    return { conversations };
  },

  deleteConversation: async (req) => {
    const { id } = req.params;
    const { guestId } = req.body;
    const userId = req.user?.id;

    if (!id) {
      throw new ApiError(400, "Conversation id required");
    }

    const query = {
      _id: id,
      ...(userId ? { userId } : { guestId }),
    };

    const deleted = await conversationRepository.findOneAndDelete(query);

    if (!deleted) {
      throw new ApiError(404, "Conversation not found");
    }

    return {};
  },

  renameConversation: async (req) => {
    const { id } = req.params;
    const { title, guestId } = req.body;
    const userId = req.user?.id;

    if (!title) {
      throw new ApiError(400, "Title is required");
    }

    const query = {
      _id: id,
      ...(userId ? { userId } : { guestId }),
    };

    const convo = await conversationRepository.findOne(query);

    if (!convo) {
      throw new ApiError(404, "Conversation not found");
    }

    convo.title = title;
    await conversationRepository.save(convo);

    return {};
  },

  pinConversation: async (req) => {
    const { id } = req.params;
    const { pin, guestId } = req.body;
    const userId = req.user?.id;

    const query = {
      _id: id,
      ...(userId ? { userId } : { guestId }),
    };

    const convo = await conversationRepository.findOne(query);

    if (!convo) {
      throw new ApiError(404, "Conversation not found");
    }

    convo.pinnedAt = pin ? new Date() : null;

    await conversationRepository.save(convo);

    return { pinnedAt: convo.pinnedAt };
  },
};