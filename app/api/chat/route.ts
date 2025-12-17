import { NextResponse } from "next/server";

type IncomingFile = {
  fieldName: string;
  name: string;
  type: string;
  size: number;
  text?: string; // only for small, text-like files
};

function isTextLike(mime: string): boolean {
  if (!mime) return true; // some browsers omit type
  return (
    mime.startsWith("text/") ||
    mime === "application/json" ||
    mime === "application/xml" ||
    mime === "application/yaml" ||
    mime === "application/x-yaml" ||
    mime === "application/javascript" ||
    mime === "application/typescript" ||
    mime === "application/x-www-form-urlencoded"
  );
}

async function parseRequest(request: Request): Promise<{
  message: string;
  files: IncomingFile[];
}> {
  const contentType = request.headers.get("content-type") || "";

  // Default: JSON payload
  if (!contentType.includes("multipart/form-data")) {
    const body = await request.json().catch(() => ({} as any));
    return {
      message: typeof body?.message === "string" ? body.message : "",
      files: [],
    };
  }

  // Multipart: message + one or more files
  const form = await request.formData();
  const message = String(form.get("message") ?? "");

  const files: IncomingFile[] = [];

  // Collect *all* File parts regardless of field name (supports `files`, `file`, etc.)
  for (const [key, value] of form.entries()) {
    if (value instanceof File) {
      files.push({
        fieldName: key,
        name: value.name || "(unnamed)",
        type: value.type || "",
        size: value.size,
      });
    }
  }

  // Inline small text-like files so they can be used by the model.
  // NOTE: This doesn't "upload" files to Groq; it makes them reach *your server* and be included in the prompt.
  const MAX_INLINE_BYTES = 200_000; // ~200KB per file
  for (let i = 0; i < files.length; i++) {
    const fileMeta = files[i];
    const file = form.get(fileMeta.fieldName);
    if (!(file instanceof File)) continue;

    if (file.size <= MAX_INLINE_BYTES && isTextLike(file.type)) {
      const buf = await file.arrayBuffer();
      const text = new TextDecoder("utf-8", { fatal: false }).decode(buf);
      files[i] = { ...fileMeta, text };
    }
  }

  return { message, files };
}

function buildUserContent(message: string, files: IncomingFile[]): string {
  if (!files.length) return message;

  const parts: string[] = [message.trim(), "", "Attached files:"];

  for (const f of files) {
    parts.push(
      "---",
      `Field: ${f.fieldName}`,
      `File: ${f.name}`,
      `Type: ${f.type || "(unknown)"}`,
      `Size: ${f.size} bytes`,
      "Content:",
      f.text ? f.text : "[Binary file or too large to inline]"
    );
  }

  return parts.join("\n").trim();
}

export async function POST(request: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Missing GROQ_API_KEY" },
        { status: 500 }
      );
    }

    const { message, files } = await parseRequest(request);

    const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

    const userContent = buildUserContent(message, files);

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: `You are a prompt enhancement assistant. Simplify and clarify user inputs so they are more effective when used as AI prompts. Output should be concise, specific, and easy to understand.
              Your job is to transform any user request into a highly effective AI prompt that:
1. Removes ambiguity and vague terms.
2. Specifies context, tone, and constraints.
3. Uses precise, concise language.
4. Breaks complex requests into clear steps when needed.
5. Outputs ONLY the optimized prompt — no explanations.

Example 1:
User: "Tell me about space"
"Write a short, engaging article for beginners explaining how planets form, in under 200 words."

Example 2:
User: "Make me a diet plan"
"Create a 7-day vegetarian meal plan for weight loss, including calorie counts and recipes."`,
          },
          { role: "user", content: userContent },
        ],
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("Groq API error response:", data);
      return NextResponse.json({ error: data }, { status: res.status });
    }

    const content = data?.choices?.[0]?.message?.content;

    return NextResponse.json(
      {
        response: typeof content === "string" && content.length
          ? content
          : "No response generated",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        error: error?.message || "Something went wrong",
      },
      { status: 500 }
    );
  }
}
