import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
// import { zodTextFormat } from "openai/helpers/zod";
import { SITE_DOCS } from "@/lib/site-knowledge";
import { rankDocs } from "@/lib/retrieval";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getOutputText(response: any): string {
  if (typeof response?.output_text === "string") {
    return response.output_text;
  }

  // Fallback (some Groq models return structured output array)
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

function buildContext(docs: typeof SITE_DOCS) {
  return docs
    .map((d) => {
      // Keep context compact
      const clipped =
        d.content.length > 1200 ? d.content.slice(0, 1200) + "…" : d.content;
      return `### ${d.title}\nURL: ${d.url}\n${clipped}`;
    })
    .join("\n\n");
}

function safeTrimMessages(
  messages: { role: "user" | "assistant"; content: string }[]
) {
  // keep last 10 messages, clamp size
  return messages.slice(-10).map((m) => ({
    role: m.role,
    content: m.content.slice(0, 1500),
  }));
}

export async function POST(req: Request) {
  const raw = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message:
          "Invalid request body. Expected { messages: [{role, content}] }",
      },
      { status: 400 }
    );
  }

  const messages = safeTrimMessages(parsed.data.messages);
  const lastUser =
    [...messages]
      .reverse()
      .find((m) => m.role === "user")
      ?.content?.trim() ?? "";

  if (!lastUser) {
    return NextResponse.json(
      { message: "Missing user message." },
      { status: 400 }
    );
  }

  // Retrieve most relevant site docs
  const ranked = rankDocs(lastUser, SITE_DOCS, 5);
  const bestDocs = ranked.some((r) => r.score > 0)
    ? ranked.filter((r) => r.score > 0).map((r) => r.doc)
    : ranked.map((r) => r.doc).slice(0, 3);

  const allowedSources = bestDocs.map((d) => ({ title: d.title, url: d.url }));
  const allowedUrlSet = new Set(allowedSources.map((s) => s.url));

  const instructions = `
You are the PromptX website assistant.

STYLE & TONE (VERY IMPORTANT):
- Respond like ChatGPT: natural, friendly, conversational.
- DO NOT output JSON, bullet dumps, or raw data blocks.
- Write in short paragraphs with emphasis where helpful.
- Make answers pleasant to read for non-technical users.

CONTENT RULES:
- Use ONLY the provided site content.
- If something is not available yet, say so clearly and politely.
- Do NOT invent people, features, or timelines.

SOURCES:
- If a page is relevant, mention it naturally (example: "You can see this on the Team page").
- Do NOT print URLs in a raw list.

FOLLOW-UP QUESTIONS:
- End with 2–3 natural follow-up questions.
- Phrase them like a human conversation, not a survey.

EXAMPLE GOOD ENDING:
"If you'd like, I can also tell you about pricing, future plans, or how PromptX works."
`.trim();

  const siteContext = buildContext(bestDocs);

  // If no key, still return something usable for UI testing
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({
      answer:
        "AI is not configured yet (missing GROQ_API_KEY). Add it to `.env.local` to enable ChatGPT-style answers.\n\nFor now, here are the most relevant pages:\n" +
        allowedSources.map((s) => `- ${s.title} (${s.url})`).join("\n"),
      sources: allowedSources,
      followups: [
        "Who built PromptX?",
        "Is Pricing available yet?",
        "What pages are under construction?",
      ],
    });
  }

  const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  });
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile"; // from OpenAI quickstart examples

  // Build input in Responses API message format (system + conversation)
  const input = [
    {
      role: "system" as const,
      content:
        `${instructions}\n\n` +
        `Allowed sources:\n${allowedSources
          .map((s) => `- ${s.title}: ${s.url}`)
          .join("\n")}\n\n` +
        `Site content:\n${siteContext}`,
    },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  try {
    const response = await openai.responses.create({
      model,
      input,
      temperature: 0.2,
      max_output_tokens: 600,
    });

    const answer = getOutputText(response);

    return NextResponse.json({
      answer: answer || "Sorry — I couldn't generate an answer.",
      sources: allowedSources,
      followups: [
        "Who built PromptX?",
        "Is pricing available yet?",
        "What pages are under construction?",
      ],
    });
  } catch (err) {
    const fallback = await openai.responses.create({
      model,
      input,
      temperature: 0.2,
      max_output_tokens: 600,
    });

    const answer = getOutputText(fallback);

    return NextResponse.json({
      answer: answer || "Sorry — I couldn't generate an answer.",
      sources: allowedSources,
      followups: [
        "Who built PromptX?",
        "Is pricing available yet?",
        "What pages are under construction?",
      ],
    });
  }
}
