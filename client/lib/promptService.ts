export const TARGET_MODEL_STYLES: Record<string, { label: string; guidance: string }> = {
  chatgpt: {
    label: "ChatGPT (GPT-4o)",
    guidance: `
## TARGET MODEL: CHATGPT (GPT-4o / GPT-4)
- Structure: Clear Markdown headers (## Objective, ## Requirements, ## Format).
- Direct imperative verbs. Define format and output constraints explicitly once.
- Delimiters: Triple backticks for code/data inputs.
- Efficiency: Strip conversational pleasantries and flattery persona text. State constraints directly.
`,
  },
  "openai-reasoning": {
    label: "OpenAI o1 / o3",
    guidance: `
## TARGET MODEL: OPENAI REASONING (o1 / o3)
- CRITICAL: Never include "think step by step", "show your reasoning", or "explain your logic". The model plans internally.
- Zero-shot first: State the problem, technical constraints, and end deliverable cleanly without artificial scratchpads.
- Context minimalism: Pass only high-signal context to avoid cluttering internal deliberation.
`,
  },
  claude: {
    label: "Claude 3.5 / 3.7",
    guidance: `
## TARGET MODEL: CLAUDE (Anthropic)
- Structure: Wrap sections in semantic XML tags: <instructions>, <context>, <requirements>, <output_format>.
- Role: Single direct role sentence (avoid flattering multi-sentence persona fluff).
- Direct Start: Instruct Claude to begin directly with the output content to suppress conversational throat-clearing.
`,
  },
  gemini: {
    label: "Gemini 1.5 / 2.0",
    guidance: `
## TARGET MODEL: GEMINI (Google)
- Recency Placement: Place large context/reference data first; place specific task instructions and output format at the very end.
- Direct positive constraints: Specify what to do rather than verbose lists of what to avoid.
- Concise bulleted sections.
`,
  },
  "deepseek-r1": {
    label: "DeepSeek (V3 & R1)",
    guidance: `
## TARGET MODEL: DEEPSEEK (V3 & R1)
- User Prompt Consolidation: Keep full task directives in the user prompt.
- Do NOT script step-by-step thinking for R1; allow autonomous <think> tokens.
- For math/code/logic, instruct the model to wrap final answer in \\boxed{}.
`,
  },
  llama: {
    label: "Meta Llama 3.3",
    guidance: `
## TARGET MODEL: META LLAMA 3.3
- Clean Markdown headers and bulleted requirements.
- Prefix consistency: Keep instructions structured cleanly to leverage KV prompt caching.
`,
  },
  mistral: {
    label: "Mistral Large / Nemo",
    guidance: `
## TARGET MODEL: MISTRAL AI
- Tight Markdown bullet points.
- Define schema explicitly for extraction tasks.
`,
  },
  qwen: {
    label: "Qwen 2.5",
    guidance: `
## TARGET MODEL: QWEN 2.5
- Explicit schema keys for structured data.
- Direct task instructions with clear parameter boundaries.
`,
  },
  grok: {
    label: "Grok (xAI)",
    guidance: `
## TARGET MODEL: GROK (xAI)
- Subject-first declaration with candid, direct register.
- Specify exact schema or data format at prompt end.
`,
  },
  midjourney: {
    label: "Midjourney v6.1",
    guidance: `
## TARGET MODEL: MIDJOURNEY (v6.1)
- Formula: [Subject + action], [environment + lighting], [artistic medium / camera details] --ar [ratio] --v 6.1
- Zero tag-soup: Delete "photorealistic", "8k", "masterpiece", "trending on Artstation".
- Put rendered text in quotes ("Bean Haven"). Place all parameter flags (--ar, --v) at the very end.
`,
  },
  flux: {
    label: "FLUX.1 (Black Forest Labs)",
    guidance: `
## TARGET MODEL: FLUX.1
- Natural descriptive prose; front-load primary subject and action.
- Zero comma tag-soup. No negative prompts ("no blur").
- Wrap any legible text inside quotes ("Text").
`,
  },
  ideogram: {
    label: "Ideogram 2.0",
    guidance: `
## TARGET MODEL: IDEOGRAM 2.0
- Formula: [Subject] + [exact text in quotes] + [typography style] + [layout/placement] + [color palette]
- Place quotation-marked text near the start for highest typography accuracy.
`,
  },
  dalle: {
    label: "DALL-E 3 / Imagen 3",
    guidance: `
## TARGET MODEL: DALL-E 3 / IMAGEN 3
- Descriptive visual paragraph focusing on composition, lighting angle, materials, and subject.
- Avoid camera gear buzzwords unless authentic documentary style is intended.
`,
  },
  runway: {
    label: "Runway Gen-3 / Gen-4",
    guidance: `
## TARGET MODEL: RUNWAY (Gen-3 / Gen-4)
- 3-Part Kinetic Formula: [Camera Movement] + [Subject & Scene Establishing] + [Lighting & Ambient Motion]
- Lead with camera movement (e.g., "FPV forward tracking shot").
- Focus on a single continuous temporal action.
`,
  },
  veo: {
    label: "Google Veo 2",
    guidance: `
## TARGET MODEL: GOOGLE VEO 2
- Structure: [Shot framing & camera movement] of [subject action] in [setting]. [Lighting & atmosphere].
- Spoken dialogue: Format with colon without quotes (character says: [text]) to avoid on-screen text bugs.
- Single continuous scene take.
`,
  },
  kling: {
    label: "Kling AI",
    guidance: `
## TARGET MODEL: KLING AI
- Structure: [Camera angle & velocity] + [subject dynamic motion] + [environmental lighting].
- Explicitly state camera trajectory and motion speed.
`,
  },
};

export const BASE_SYSTEM_PROMPT = `
You are PromptX, an expert prompt optimization engine. Your sole job is to transform raw user ideas into compact, high-efficiency prompts tailored to the user's selected target model.

OPERATIONAL RULES:
1. OUTPUT ONLY THE FINAL PROMPT: Do not answer the user's query. Do not execute the task. Do not include conversational filler like "Here is your enhanced prompt:" or explanatory preambles. Output only the prompt ready to copy and paste.
2. MAXIMUM TOKEN EFFICIENCY: Delete all filler phrases ("Please act as", "I want you to", "as an expert", "kindly"). Consolidate duplicate requirements. Specify constraints and formats once.
3. ADAPTER CONFORMANCE: Apply the exact structural syntax of the target model (e.g., XML tags for Claude, camera-first for video, quotation marks for text-in-image, parameter flags for Midjourney).
4. AMBIGUITY HANDLING: If an essential variable is missing that makes prompt generation impossible, append exactly one single-sentence clarifying question wrapped in <clarification>...</clarification> tags at the very end. Otherwise, make the most plausible professional assumption and output the prompt immediately.
`;

export async function enhancePromptWithGroq({
  content,
  targetModel = "chatgpt",
  conversationHistory = [],
}: {
  content: string;
  targetModel?: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable is not configured.");
  }
  const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

  const modelStyle =
    TARGET_MODEL_STYLES[targetModel.toLowerCase()]?.guidance ||
    TARGET_MODEL_STYLES["chatgpt"].guidance;

  const systemInstruction = `${BASE_SYSTEM_PROMPT}\n\n${modelStyle}`;

  const messages: Array<{ role: string; content: string }> = [
    { role: "system", content: systemInstruction },
  ];

  // Include recent conversation context (up to last 6 messages) if available
  if (conversationHistory.length > 0) {
    const recent = conversationHistory.slice(-6);
    recent.forEach((msg) => {
      if (msg.content) {
        messages.push({
          role: msg.role === "assistant" ? "assistant" : "user",
          content: msg.content,
        });
      }
    });
  }

  messages.push({
    role: "user",
    content: `Please transform and optimize the following request into a production-grade prompt for ${targetModel.toUpperCase()}:\n\n"${content}"`,
  });

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 2500,
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const enhancedContent =
    data?.choices?.[0]?.message?.content ||
    "Error: No content received from enhancer.";

  return enhancedContent.trim();
}
