import { z } from "zod";
import { SITE_DOCS } from "../lib/site-knowledge.js";
import { rankDocs } from "../lib/retrieval.js";
import asyncHandler from "../utils/asyncHandler.js";
import  ApiError  from "../utils/ApiError.js";
import { sendResponse } from "../utils/sendResponse.js";
import { aiClient } from "../utils/aiClient.js";

function getOutputText(response) {
  if (typeof response?.output_text === "string") {
    return response.output_text;
  }

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

const BodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1),
      })
    )
    .min(1),
});

function buildContext(docs) {
  return docs
    .map((d) => {
      const clipped =
        d.content.length > 1200 ? d.content.slice(0, 1200) + "…" : d.content;

      return `### ${d.title}\nURL: ${d.url}\n${clipped}`;
    })
    .join("\n\n");
}

function safeTrimMessages(messages) {
  return messages.slice(-10).map((m) => ({
    role: m.role,
    content: m.content.slice(0, 1500),
  }));
}

export const askPromptX = asyncHandler(async (req, res) => {
  const parsed = BodySchema.safeParse(req.body);

  if (!parsed.success) {
    throw new ApiError(
      400,
      "Invalid request body. Expected { messages: [{role, content}] }"
    );
  }

  const messages = safeTrimMessages(parsed.data.messages);

  const lastUser =
    [...messages]
      .reverse()
      .find((m) => m.role === "user")
      ?.content?.trim() ?? "";

  if (!lastUser) {
    throw new ApiError(400, "Missing user message.");
  }

  const ranked = rankDocs(lastUser, SITE_DOCS, 5);

  const bestDocs = ranked.some((r) => r.score > 0)
    ? ranked.filter((r) => r.score > 0).map((r) => r.doc)
    : ranked.map((r) => r.doc).slice(0, 3);

  const allowedSources = bestDocs.map((d) => ({
    title: d.title,
    url: d.url,
  }));

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

  const siteContext = buildContext(bestDocs);

  if (!process.env.GROQ_API_KEY) {
    return sendResponse(res, "AI not configured", 200, {
      answer: "AI is not configured yet. Add GROQ_API_KEY to enable answers.",
      sources: allowedSources,
    });
  }

  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  const input = [
    {
      role: "system",
      content: `${instructions}\n\nSite content:\n${siteContext}`,
    },
    ...messages,
  ];

  const response = await aiClient.responses.create({
    model,
    input,
    temperature: 0.2,
    max_output_tokens: 600,
  });

  const answer = getOutputText(response);

  return sendResponse(res, "AI response generated", 200, {
    answer: answer || "Sorry — I couldn't generate an answer.",
    sources: allowedSources,
  });
});