import asyncHandler from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/sendResponse.js";
import { conversationService } from "../services/conversation.service.js";

export const createConversation = asyncHandler(async (req, res) => {
  const result = await conversationService.createConversation(req);

  return sendResponse(res, "Conversation created", 201, result);
});

export const listConversations = asyncHandler(async (req, res) => {
  const result = await conversationService.listConversations(req);

  return sendResponse(res, "Conversations fetched", 200, result);
});

export const deleteConversation = asyncHandler(async (req, res) => {
  await conversationService.deleteConversation(req);

  return sendResponse(res, "Conversation deleted", 200);
});

export const renameConversation = asyncHandler(async (req, res) => {
  await conversationService.renameConversation(req);

  return sendResponse(res, "Conversation renamed", 200);
});

export const pinConversation = asyncHandler(async (req, res) => {
  const result = await conversationService.pinConversation(req);

  return sendResponse(res, "Conversation updated", 200, result);
});