import { TEAM } from "../data/team.data.js";

export const teamService = {
  searchTeam: (query) => {
    const q = (query || "").trim().toLowerCase();

    if (!q) {
      return [];
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

    return results;
  },
};