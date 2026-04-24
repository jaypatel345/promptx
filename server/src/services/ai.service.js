import fetch from "node-fetch";
import ApiError from "../utils/ApiError.js";

const MAX_INLINE_BYTES = 200000;

// --------------------
// Helper: check text-like files
// --------------------
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

// --------------------
// Helper: normalize files
// --------------------
function processFiles(files = []) {
  return files.map((file) => {
    let text = null;

    if (file.size <= MAX_INLINE_BYTES && isTextLike(file.mimetype)) {
      text = file.buffer.toString("utf8");
    }

    return {
      name: file.originalname,
      type: file.mimetype,
      size: file.size,
      text,
    };
  });
}

// --------------------
// Helper: build prompt
// --------------------
function buildUserContent(message, files) {
  if (!files.length) return message;

  const parts = [message.trim(), "", "Attached files:"];

  for (const f of files) {
    parts.push(
      "---",
      `File: ${f.name}`,
      `Type: ${f.type || "(unknown)"}`,
      `Size: ${f.size} bytes`,
      "Content:",
      f.text ? f.text : "[Binary file or too large]"
    );
  }

  return parts.join("\n").trim();
}

// --------------------
// MAIN SERVICE
// --------------------
export const aiService = {
  enhancePrompt: async ({ message, files }) => {
    if (!process.env.GROQ_API_KEY) {
      throw new ApiError(500, "Missing GROQ_API_KEY");
    }

    if (!message) {
      throw new ApiError(400, "Message is required");
    }

    // 1. Process files
    const processedFiles = processFiles(files);

    // 2. Build prompt
    const userContent = buildUserContent(message, processedFiles);

    const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

    // 3. Call AI
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
          messages: [
            {
              role: "system",
              content:
                "You are a prompt enhancement assistant. Improve the user's prompt so it becomes clear, specific, and effective for AI usage. Output ONLY the improved prompt.",
            },
            {
              role: "user",
              content: userContent,
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(response.status, "AI request failed");
    }

    let content = data?.choices?.[0]?.message?.content;

    // 4. Clean response
    if (typeof content === "string") {
      content = content.trim();

      if (
        (content.startsWith('"') && content.endsWith('"')) ||
        (content.startsWith("'") && content.endsWith("'"))
      ) {
        content = content.slice(1, -1).trim();
      }
    }

    return content || "No response generated";
  },
};