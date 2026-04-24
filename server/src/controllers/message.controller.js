import asyncHandler from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/sendResponse.js";
import { messageService } from "../services/message.service.js";

export const getMessages = asyncHandler(async (req, res) => {
  const messages = await messageService.getMessages(req);

  return sendResponse(res, "Messages fetched", 200, { messages });
});

export const createMessage = asyncHandler(async (req, res) => {
  const result = await messageService.createMessage(req);

  return sendResponse(res, "Message created", 201, result);
});