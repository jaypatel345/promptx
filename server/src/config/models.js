// Groq-hosted chat models the frontend can let a user pick between.
// All of these run through the same GROQ_API_KEY / endpoint, so adding one
// here is just a matter of adding the id Groq expects.
export const AVAILABLE_MODELS = [
  {
    id: "openai/gpt-oss-120b",
    label: "GPT-OSS 120B",
    description: "Most capable — best for detailed, high-quality prompts",
  },
  {
    id: "llama-3.3-70b-versatile",
    label: "Llama 3.3 70B",
    description: "Balanced quality and speed",
  },
  {
    id: "llama-3.1-8b-instant",
    label: "Llama 3.1 8B",
    description: "Fastest responses",
  },
];

export const DEFAULT_MODEL =
  process.env.GROQ_MODEL || AVAILABLE_MODELS[0].id;

const ALLOWED_MODEL_IDS = new Set(AVAILABLE_MODELS.map((m) => m.id));

// Falls back to the default model whenever the requested id isn't one we
// explicitly support, so a stale client or tampered request can't make an
// arbitrary/unpriced model call through our Groq key.
export function resolveModel(modelId) {
  if (typeof modelId === "string" && ALLOWED_MODEL_IDS.has(modelId)) {
    return modelId;
  }

  return DEFAULT_MODEL;
}
