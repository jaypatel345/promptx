import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import  ApiError  from "../utils/ApiError.js";
import { sendResponse } from "../utils/sendResponse.js";


// GET MESSAGES
export const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  if (!conversationId) {
    throw new ApiError(400, "conversationId is required");
  }

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  const messages = await Message.find({ conversationId }).sort({
    createdAt: 1,
  });

  return sendResponse(res, "Messages fetched", 200, { messages });
});


// CREATE MESSAGE
export const createMessage = asyncHandler(async (req, res) => {
  const { conversationId, role, content, attachments } = req.body;

  if (!conversationId || !role || !content) {
    throw new ApiError(400, "Missing required fields");
  }

  const newMessage = await Message.create({
    conversationId,
    role,
    content,
    attachments: attachments || [],
  });

  if (role === "user") {
    const conversation = await Conversation.findById(conversationId);

    if (
      conversation &&
      (!conversation.title || conversation.title === "New Chat")
    ) {
      const shortTitle = content.split(" ").slice(0, 6).join(" ");

      conversation.title = shortTitle;
      await conversation.save();
    }
  }

  return sendResponse(res, "Message created", 201, {
    message: newMessage,
  });
});
