import multer from "multer";
import asyncHandler from "../utils/asyncHandler.js";
import  ApiError  from "../utils/ApiError.js";
import { sendResponse } from "../utils/sendResponse.js";

const upload = multer({ storage: multer.memoryStorage() });

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

function buildUserContent(message, files) {
  if (!files.length) return message;

  const parts = [message.trim(), "", "Attached files:"];

  for (const f of files) {
    parts.push(
      "---",
      `File: ${f.originalname}`,
      `Type: ${f.mimetype || "(unknown)"}`,
      `Size: ${f.size} bytes`,
      "Content:",
      f.text ? f.text : "[Binary file or too large]"
    );
  }

  return parts.join("\n").trim();
}

export const enhancePrompt = [
  upload.any(),

  asyncHandler(async (req, res) => {
    if (!process.env.GROQ_API_KEY) {
      throw new ApiError(500, "Missing GROQ_API_KEY");
    }

    const message = req.body?.message;

    if (!message) {
      throw new ApiError(400, "Message is required");
    }

    const MAX_INLINE_BYTES = 200000;
    const files = [];

    for (const file of req.files || []) {
      let text = null;

      if (file.size <= MAX_INLINE_BYTES && isTextLike(file.mimetype)) {
        text = file.buffer.toString("utf8");
      }

      files.push({
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        text,
      });
    }

    const userContent = buildUserContent(message, files);

    const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

    const apiRes = await fetch(
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
              content: `You are a prompt enhancement assistant.
Rewrite user input into a clear, effective AI prompt.
Output ONLY the improved prompt.`,
            },
            { role: "user", content: userContent },
          ],
        }),
      }
    );

    const data = await apiRes.json();

    if (!apiRes.ok) {
      throw new ApiError(apiRes.status, "AI request failed");
    }

    let content = data?.choices?.[0]?.message?.content;

    if (typeof content === "string") {
      content = content.trim();

      if (
        (content.startsWith('"') && content.endsWith('"')) ||
        (content.startsWith("'") && content.endsWith("'"))
      ) {
        content = content.slice(1, -1).trim();
      }
    }

    return sendResponse(res, "Prompt enhanced", 200, {
      response:
        typeof content === "string" && content.length
          ? content
          : "No response generated",
    });
  }),
];