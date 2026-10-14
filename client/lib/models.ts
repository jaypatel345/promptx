export interface TargetModelOption {
  id: string;
  label: string;
  description: string;
  category?: "text" | "reasoning" | "image" | "video";
}

// The target model the user intends to paste the enhanced prompt into.
// PromptX tailors syntax, delimiters, and token efficiency to the target model's architecture.
export const TARGET_MODELS: TargetModelOption[] = [
  // Text Models
  {
    id: "chatgpt",
    label: "ChatGPT (GPT-4o)",
    description: "Markdown structure, clear output delimiters, concise instructions",
    category: "text",
  },
  {
    id: "openai-reasoning",
    label: "OpenAI o1 / o3",
    description: "Zero-shot direct constraints, autonomous internal reasoning (no CoT)",
    category: "reasoning",
  },
  {
    id: "claude",
    label: "Claude 3.5 / 3.7",
    description: "Semantic XML tags (<instructions>, <context>), zero conversational preambles",
    category: "text",
  },
  {
    id: "gemini",
    label: "Gemini 1.5 / 2.0",
    description: "Context-first ordering, task at prompt end, direct positive constraints",
    category: "text",
  },
  {
    id: "deepseek-r1",
    label: "DeepSeek (V3 & R1)",
    description: "User-prompt consolidation, autonomous <think> blocks, boxed output",
    category: "reasoning",
  },
  {
    id: "llama",
    label: "Meta Llama 3.3",
    description: "Clean role separation, bulleted constraints, high cache prefix adherence",
    category: "text",
  },
  {
    id: "mistral",
    label: "Mistral Large / Nemo",
    description: "Consistent prefix structure for server prompt caching",
    category: "text",
  },
  {
    id: "qwen",
    label: "Qwen 2.5",
    description: "ChatML-aligned directives, explicit schema extraction",
    category: "text",
  },
  {
    id: "grok",
    label: "Grok (xAI)",
    description: "Subject-first declaration, direct conversational register",
    category: "text",
  },

  // Image Models
  {
    id: "midjourney",
    label: "Midjourney v6.1",
    description: "Natural descriptive sentences, parameter flags (--ar, --v), zero tag soup",
    category: "image",
  },
  {
    id: "flux",
    label: "FLUX.1 (Black Forest)",
    description: "Front-loaded subject/action, descriptive prose, quoted text",
    category: "image",
  },
  {
    id: "ideogram",
    label: "Ideogram 2.0",
    description: "Quoted typography ('Text'), font styles, layout and palette",
    category: "image",
  },
  {
    id: "dalle",
    label: "DALL-E 3 / Imagen 3",
    description: "Descriptive composition, lighting, materials, and Scandinavian/studio focus",
    category: "image",
  },

  // Video Models
  {
    id: "runway",
    label: "Runway Gen-3 / Gen-4",
    description: "3-part kinetic formula: Camera Movement + Scene + Lighting/Motion",
    category: "video",
  },
  {
    id: "veo",
    label: "Google Veo 2",
    description: "Shot framing first, single continuous temporal action, unquoted dialogue",
    category: "video",
  },
  {
    id: "kling",
    label: "Kling AI",
    description: "Camera velocity, tracking trajectory, motion blur specifications",
    category: "video",
  },
];

export const DEFAULT_TARGET_MODEL = TARGET_MODELS[0].id;

