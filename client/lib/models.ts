export interface TargetModelOption {
  id: string;
  label: string;
  description: string;
}

// The LLM the user intends to paste the enhanced prompt into — not the
// engine that generates the enhancement (that's a fixed backend detail).
// Picking one here lets the output be tailored to that model's conventions.
export const TARGET_MODELS: TargetModelOption[] = [
  {
    id: "chatgpt",
    label: "ChatGPT",
    description: "Formatted for OpenAI's ChatGPT",
  },
  {
    id: "claude",
    label: "Claude",
    description: "Formatted for Anthropic's Claude",
  },
  {
    id: "gemini",
    label: "Gemini",
    description: "Formatted for Google's Gemini",
  },
  {
    id: "grok",
    label: "Grok",
    description: "Formatted for xAI's Grok",
  },
];

export const DEFAULT_TARGET_MODEL = TARGET_MODELS[0].id;
