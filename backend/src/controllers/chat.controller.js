import fetch from "node-fetch";
import asyncHandler from "../utils/asyncHandler.js";
import  ApiError  from "../utils/ApiError.js";
import { sendResponse } from "../utils/sendResponse.js";

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
      `Field: ${f.fieldName}`,
      `File: ${f.name}`,
      `Type: ${f.type || "(unknown)"}`,
      `Size: ${f.size} bytes`,
      "Content:",
      f.text ? f.text : "[Binary file or too large]"
    );
  }

  return parts.join("\n").trim();
}

export const chatPromptEnhancer = asyncHandler(async (req, res) => {
  if (!process.env.GROQ_API_KEY) {
    throw new ApiError(500, "Missing GROQ_API_KEY");
  }

  const message = req.body.message;

  if (!message) {
    throw new ApiError(400, "Message is required");
  }

  const uploadedFiles = req.files || [];

  const files = uploadedFiles.map((file) => ({
    fieldName: file.fieldname,
    name: file.originalname,
    type: file.mimetype,
    size: file.size,
    text:
      file.size < 200000 && isTextLike(file.mimetype)
        ? file.buffer.toString("utf8")
        : undefined,
  }));

  const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  const userContent = buildUserContent(message, files);

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

  if (typeof content === "string") {
    content = content.trim();

    if (
      (content.startsWith('"') && content.endsWith('"')) ||
      (content.startsWith("'") && content.endsWith("'"))
    ) {
      content = content.slice(1, -1).trim();
    }
  }

  return sendResponse(res, "Prompt enhanced successfully", 200, {
    response: content || "No response generated",
  });
});