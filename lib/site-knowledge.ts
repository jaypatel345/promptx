export type SiteDoc = {
  id: string;
  title: string;
  url: string;
  content: string;
  tags?: string[];
};

export const SITE_DOCS: SiteDoc[] = [
  {
    id: "team",
    title: "Team",
    url: "/Teams",
    tags: ["team", "founder", "jay", "about", "who built"],
    content: `
PromptX Team (current status):
- PromptX is currently built by a single contributor.
- Name: Jay Patel
- Role: Founder of PromptX
- Education: B.Tech (completed)
- Location: Surat, Gujarat, India
- Contribution: Jay is currently the only person contributing to the project.
`.trim(),
  },
  {
    id: "pricing",
    title: "Pricing",
    url: "/Pricing",
    tags: ["pricing", "plans", "cost", "price"],
    content: `
Pricing page status:
- The Pricing page is currently under construction and shows a placeholder message.
- Pricing details are not published yet.
`.trim(),
  },
  {
    id: "site-status",
    title: "Site status",
    url: "/",
    tags: ["status", "under construction", "work in progress"],
    content: `
PromptX site status:
- Some pages may still be placeholders or not fully built yet.
- If a user asks something that isn't in the site content yet, say it's not available yet.
`.trim(),
  },
];
