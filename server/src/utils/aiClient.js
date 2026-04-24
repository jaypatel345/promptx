// utils/aiClient.js
import OpenAI from "openai";

export function getAiClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  return new OpenAI({
    apiKey,
    baseURL: "https://api.groq.com/openai/v1",
  });
}
