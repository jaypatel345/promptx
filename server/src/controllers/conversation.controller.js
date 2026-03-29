import Conversation from "../models/conversation.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import  ApiError  from "../utils/ApiError.js";
import { sendResponse } from "../utils/sendResponse.js";

// CREATE CONVERSATION
export const createConversation = asyncHandler(async (req, res) => {
  const { title, guestId } = req.body;
  const userId = req.user?.id || null;

  if (!userId && !guestId) {
    throw new ApiError(400, "Missing guestId or login token");
  }

  const conversation = await Conversation.create({
    title: title || "New Chat",
    userId: userId || null,
    guestId: userId ? null : guestId,
  });

  return sendResponse(res, "Conversation created", 201, {
    conversationId: conversation._id,
  });
});

// LIST CONVERSATIONS
export const listConversations = asyncHandler(async (req, res) => {
  const { guestId } = req.query;
  const userId = req.user?.id;

  const query = userId ? { userId } : guestId ? { guestId } : null;

  if (!query) {
    throw new ApiError(401, "Unauthorized");
  }

  const conversations = await Conversation.find(query).sort({
    pinnedAt: -1,
    createdAt: -1,
  });

  return sendResponse(res, "Conversations fetched", 200, {
    conversations,
  });
});

// DELETE CONVERSATION
export const deleteConversation = asyncHandler(async (req, res) => {
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

  const deleted = await Conversation.findOneAndDelete(query);

  if (!deleted) {
    throw new ApiError(404, "Conversation not found");
  }

  return sendResponse(res, "Conversation deleted", 200);
});

// RENAME CONVERSATION
export const renameConversation = asyncHandler(async (req, res) => {
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

  const convo = await Conversation.findOne(query);

  if (!convo) {
    throw new ApiError(404, "Conversation not found");
  }

  convo.title = title;
  await convo.save();

  return sendResponse(res, "Conversation renamed", 200);
});

// PIN / UNPIN CONVERSATION
export const pinConversation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { pin, guestId } = req.body;
  const userId = req.user?.id;

  const query = {
    _id: id,
    ...(userId ? { userId } : { guestId }),
  };

  const convo = await Conversation.findOne(query);

  if (!convo) {
    throw new ApiError(404, "Conversation not found");
  }

  convo.pinnedAt = pin ? new Date() : null;

  await convo.save();

  return sendResponse(res, "Conversation updated", 200, {
    pinnedAt: convo.pinnedAt,
  });
});