import { NextResponse } from "next/server";

type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio?: string;
};

// Replace this with your real team data source (DB/CMS/file)
const TEAM: TeamMember[] = [
  { id: "jay", name: "Jay Patel", role: "Founder", bio: "Works on PromptX" },
  { id: "dev1", name: "Dev One", role: "Frontend", bio: "Next.js + UI" },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();

  if (!q) {
    return NextResponse.json({ results: [] });
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
      href: `/Teams#${m.id}`, // update to your real profile route
    }));

  return NextResponse.json({ results });
}