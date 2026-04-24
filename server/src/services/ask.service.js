import { z } from "zod";
import { SITE_DOCS } from "../lib/site-knowledge.js";
import { rankDocs } from "../lib/retrieval.js";
import ApiError from "../utils/ApiError.js";
import { getAiClient } from "../utils/aiClient.js";

// ---------------- VALIDATION ----------------
const BodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1),
      }),
    )
    .min(1),
});

// ---------------- HELPERS ----------------
function safeTrimMessages(messages) {
  return messages.slice(-10).map((m) => ({
    role: m.role,
    content: m.content.slice(0, 1500),
  }));
}

function buildContext(docs) {
  return docs
    .map((d) => {
      const clipped =
        d.content.length > 1200 ? d.content.slice(0, 1200) + "…" : d.content;
      return `### ${d.title}\nURL: ${d.url}\n${clipped}`;
    })
    .join("\n\n");
}

function getOutputText(response) {
  if (typeof response?.output_text === "string") return response.output_text;

  const parts = response?.output ?? [];
  for (const item of parts) {
    for (const c of item?.content ?? []) {
      if (c?.type === "output_text" && typeof c.text === "string") {
        return c.text;
      }
    }
  }

  return "";
}

// ---------------- MAIN SERVICE ----------------
export const askService = {
  ask: async (body) => {
    // 1. Validate
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        400,
        "Invalid request body. Expected { messages: [{role, content}] }",
      );
    }

    const messages = safeTrimMessages(parsed.data.messages);

    // 2. Get last user message
    const lastUser =
      [...messages].reverse().find((m) => m.role === "user")?.content?.trim() ??
      "";

    if (!lastUser) {
      throw new ApiError(400, "Missing user message.");
    }

    // 3. Retrieval (RAG)
    const ranked = rankDocs(lastUser, SITE_DOCS, 5);

    const bestDocs = ranked.some((r) => r.score > 0)
      ? ranked.filter((r) => r.score > 0).map((r) => r.doc)
      : ranked.map((r) => r.doc).slice(0, 3);

    const sources = bestDocs.map((d) => ({
      title: d.title,
      url: d.url,
    }));

    const siteContext = buildContext(bestDocs);

    // 4. AI setup
    const aiClient = getAiClient();
    if (!aiClient) {
      return {
        answer:
          "AI is not configured yet. Add GROQ_API_KEY to enable answers.",
        sources,
      };
    }

    const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

    const instructions = `
You are the PromptX website assistant.

STYLE & TONE:
- Respond like ChatGPT: natural and conversational
- No JSON or raw lists
- Short paragraphs

CONTENT RULES:
- Use ONLY provided site content
- Do NOT invent features
`.trim();

    const input = [
      {
        role: "system",
        content: `${instructions}\n\nSite content:\n${siteContext}`,
      },
      ...messages,
    ];

    // 5. Call AI
    try {
      const response = await aiClient.responses.create({
        model,
        input,
        temperature: 0.2,
        max_output_tokens: 600,
      });

      const answer = getOutputText(response);

      return {
        answer: answer || "Sorry — I couldn't generate an answer.",
        sources,
      };
    } catch (err) {
      console.error("AI request error:", err);

      return {
        answer: "Sorry — AI failed to respond. Try again later.",
        sources,
      };
    }
  },
};