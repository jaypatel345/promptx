import fetch from "node-fetch";
import ApiError from "../utils/ApiError.js";
import { getPromptSignature } from "../utils/promptSignature.js";
import { SYSTEM_PROMPT } from "../prompts/systemPrompt.js";

const MAX_INLINE_BYTES = 200000;

function isTextLike(mime) {
  if (!mime) return true;

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

function detectFileCategory(filename = "") {
  const name = filename.toLowerCase();

  console.log("SYSTEM_PROMPT:", SYSTEM_PROMPT);

  const exampleKeywords = [
    "example",
    "examples",
    "sample",
    "samples",
    "reference-output",
    "brand-voice",
    "linkedin-posts",
    "writing-style",
  ];

  return exampleKeywords.some((keyword) => name.includes(keyword))
    ? "example"
    : "reference";
}

function processFiles(files = []) {
  return files.map((file) => {
    let text = null;

    if (
      file.buffer &&
      file.size <= MAX_INLINE_BYTES &&
      isTextLike(file.mimetype)
    ) {
      text = file.buffer.toString("utf8");
    }

    return {
      name: file.originalname,
      type: file.mimetype,
      size: file.size,
      category: detectFileCategory(file.originalname),
      text,
    };
  });
}

function buildUserContent(message, files = []) {
  const parts = ["# USER REQUEST", message.trim()];

  const exampleFiles = files.filter((file) => file.category === "example");

  const referenceFiles = files.filter((file) => file.category === "reference");

  if (exampleFiles.length > 0) {
    parts.push(
      "",
      "# EXAMPLES",
      "Analyze these examples to identify patterns that should influence the enhanced prompt.",
    );

    for (const file of exampleFiles) {
      parts.push(
        "",
        `## Example File: ${file.name}`,
        `Type: ${file.type || "Unknown"}`,
        `Size: ${file.size} bytes`,
      );

      parts.push(
        "Content:",
        file.text ||
          "[Example unavailable: binary format or exceeds inline limits]",
      );
    }
  }

  if (referenceFiles.length > 0) {
    parts.push(
      "",
      "# REFERENCE MATERIALS",
      "Use these documents as factual context when improving the prompt.",
    );

    for (const file of referenceFiles) {
      parts.push(
        "",
        `## Reference File: ${file.name}`,
        `Type: ${file.type || "Unknown"}`,
        `Size: ${file.size} bytes`,
      );

      parts.push(
        "Content:",
        file.text ||
          "[Reference unavailable: binary format or exceeds inline limits]",
      );
    }
  }

  parts.push(
    "",
    "# FINAL INSTRUCTION",
    "Determine the most appropriate prompt format for this request.",
    "If the user requests a reusable prompt, generate a premium system-style prompt — not a fill-in-the-blank template.",
    "If the user requests a system prompt, generate a complete system prompt written as natural operating instructions.",
    "If the user requests prompt enhancement, rewrite the prompt directly.",
    "Preserve the original intent.",
    "Use examples and references only when beneficial.",
    "Do not fabricate missing details — embed known details in prose; use adaptive instructions when details are missing.",
    "Write sections such as Role, Mission, Operating Principles, Content Framework, Writing Rules, and Output Requirements.",
    "Never use questionnaire-style sections (My Brand, My Audience, My Voice) or multiple bracket placeholders.",
    "Use a strong ALL CAPS title, a short explanation paragraph, then the prompt body with ALL CAPS section titles (Role, Mission, Context, etc.) — no ** markers, no blank line after section titles.",
    "The final prompt should read like it was written by a senior prompt engineer for ChatGPT or Claude — not like a template repository form.",
    "Return only the final prompt.",
  );

  return parts.join("\n");
}

export const aiService = {
  enhancePrompt: async ({
    message,
    files = [],
    requestId,
    queueJobId,
    aiJobId,
  }) => {
    if (!process.env.GROQ_API_KEY) {
      throw new ApiError(500, "Missing GROQ_API_KEY");
    }

    if (!message?.trim()) {
      throw new ApiError(400, "Message is required");
    }

    const processedFiles = processFiles(files);

    const userContent = buildUserContent(message, processedFiles);
    const promptSignature = getPromptSignature(SYSTEM_PROMPT);

    console.log(
      JSON.stringify({
        level: "info",
        event: "ai.service.enhancePrompt.entered",
        service: "ai-service",
        timestamp: new Date().toISOString(),
        requestId,
        queueJobId,
        aiJobId,
        pid: process.pid,
        messageLength: message.length,
        fileCount: processedFiles.length,
        systemPromptSha256: promptSignature.sha256,
        systemPromptPreview: promptSignature.preview,
      }),
    );

    console.log("\n========== PROMPTX DEBUG ==========");
    console.log("Service: aiService.enhancePrompt");
    console.log("PID:", process.pid);
    console.log("Incoming message:", message);
    console.log("Files count:", processedFiles.length);
    console.log("Built user content:\n", userContent);

    const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

    console.log("Model:", MODEL);
    console.log("System prompt SHA256:", promptSignature.sha256);
    console.log("System prompt preview:", promptSignature.preview);

    console.log("Calling Groq API...");

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          temperature: 0.2,
          top_p: 0.9,
          max_completion_tokens: 2500,
          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT,
            },
            {
              role: "user",
              content: userContent,
            },
          ],
        }),
      },
    );

    console.log("Groq response status:", response.status);
    console.log("Groq response ok:", response.ok);

    if (!response.ok) {
      const errorText = await response.text();

      throw new ApiError(response.status, `AI request failed: ${errorText}`);
    }

    const data = await response.json();

    console.log("Groq raw response:\n", JSON.stringify(data, null, 2));

    let content = data?.choices?.[0]?.message?.content || "";

    if (typeof content === "string") {
      content = content.trim();

      if (
        (content.startsWith('"') && content.endsWith('"')) ||
        (content.startsWith("'") && content.endsWith("'"))
      ) {
        content = content.slice(1, -1).trim();
      }
    }

    console.log("Enhanced prompt output:\n", content);
    console.log("========== END DEBUG ==========\n");

    return {
      content,
      usage: data?.usage || null,
      model: MODEL,
    };
  },
};
