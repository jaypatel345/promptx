import asyncHandler from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/sendResponse.js";

// TEAM SEARCH
const TEAM = [
  {
    id: "jay",
    name: "Jay Patel",
    role: "Founder",
    bio: "Works on PromptX",
  },
];

export const searchTeam = asyncHandler(async (req, res) => {
  const q = (req.query.q || "").trim().toLowerCase();

  if (!q) {
    return sendResponse(res, "No results", 200, { results: [] });
  }

  const results = TEAM.filter((m) => {
    return (
      m.name.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q) ||
      (m.bio || "").toLowerCase().includes(q)
    );
  })
    .slice(0, 10)
    .map((m) => ({
      id: m.id,
      title: m.name,
      subtitle: m.role,
      href: `/AITeams#${m.id}`,
    }));

  return sendResponse(res, "Search results", 200, { results });
});

