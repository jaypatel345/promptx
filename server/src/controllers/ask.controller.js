import asyncHandler from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/sendResponse.js";
import { askService } from "../services/ask.service.js";

export const askPromptX = asyncHandler(async (req, res) => {
  const result = await askService.ask(req.body);

  return sendResponse(res, "AI response generated", 200, result);
});