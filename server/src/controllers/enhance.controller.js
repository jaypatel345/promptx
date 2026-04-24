import asyncHandler from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/sendResponse.js";
import { aiService } from "../services/ai.service.js";

export const enhancePrompt = asyncHandler(async (req, res) => {
  const result = await aiService.enhancePrompt({
    message: req.body.message,
    files: req.files,
  });

  return sendResponse(res, "Prompt enhanced", 200, {
    response: result,
  });
});