import asyncHandler from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/sendResponse.js";
import { teamService } from "../services/team.service.js";

export const searchTeam = asyncHandler(async (req, res) => {
  const results = teamService.searchTeam(req.query.q);

  return sendResponse(res, "Search results", 200, { results });
});