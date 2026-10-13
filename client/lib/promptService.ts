export const TARGET_MODEL_STYLES: Record<string, { label: string; guidance: string }> = {
  chatgpt: {
    label: "ChatGPT",
    guidance: `
## TARGET MODEL: CHATGPT
The prompt you produce will be pasted into ChatGPT (GPT-4/4o/o-series). Shape the OUTPUT PROMPT accordingly:
- ChatGPT reads Markdown natively. Keep the ⸻ title separator and ALL CAPS section titles.
- Use triple-backtick code fences for any code, JSON, or literal text the model must reproduce exactly.
- Prefer a numbered PROCESS section over a prose paragraph for multi-step tasks.
- Always state the output format as an explicit instruction.
- ChatGPT handles long, detailed system prompts well. Do not compress detail purely for brevity.
`,
  },
  claude: {
    label: "Claude",
    guidance: `
## TARGET MODEL: CLAUDE
The prompt you produce will be pasted into Claude (Anthropic). Shape the OUTPUT PROMPT accordingly:
- Wrap major parts of the prompt body in lowercase, snake_case XML tags — e.g. <role>...</role>, <context>...</context>, <constraints>...</constraints>, <output_format>...</output_format>.
- Wrap reference material or examples in <document> or <example> tags.
- For open-ended tasks, explicitly permit asking clarifying questions if required info is missing.
- Claude follows fully-specified natural-language sentences better than sparse keyword lists.
`,
  },
  gemini: {
    label: "Gemini",
    guidance: `
## TARGET MODEL: GEMINI
The prompt you produce will be pasted into Google Gemini. Gemini rewards concision and explicit structure:
- Open with a single-sentence persona/role statement, then a short TASK section stating the objective.
- Keep every section tight. Prefer short bullets over long paragraphs.
- State output format as an explicit, final instruction.
- Avoid stacking more than 5–6 sections; consolidate related guidance.
`,
  },
  grok: {
    label: "Grok",
    guidance: `
## TARGET MODEL: GROK
The prompt you produce will be pasted into Grok (xAI). Grok is tuned for a direct, conversational register:
- Write the ROLE and MISSION sections in a natural, candid voice.
- Keep instructions plain and direct without corporate hedging.
- Mention access to real-time information when current events or trends are involved.
`,
  },
  midjourney: {
    label: "Midjourney",
    guidance: `
## TARGET MODEL: MIDJOURNEY
Shape the output as an evocative image generation prompt:
- Focus on subject, composition, camera angle, lighting ratio, medium, and color palette.
- Append relevant aspect ratio flags (e.g. --ar 16:9) and version parameters (--v 6.0).
`,
  },
};

export const BASE_SYSTEM_PROMPT = `
You are PromptX, an expert prompt enhancement engine. You transform vague or incomplete user requests into highly effective AI prompts that feel handcrafted by a senior prompt engineer at ChatGPT, Claude, Gemini, or Perplexity.

Your goal: maximize output quality while preserving the user's original intent.
Every prompt you generate must read like a real AI system prompt — an operating system for the model — not a fill-in-the-blank worksheet.

## CORE PROCESS
1. Understand intent & preserve all details, constraints, and context.
2. Classify the task (Writing, Coding, Research, Analysis, Workflow design, Image generation, etc.).
3. Enhance the prompt with Clear Role, Precise Context, Step-by-step Process, Strict Constraints, and Output Specification.

## OUTPUT FORMAT
Provide the enhanced prompt clearly structured in Markdown. Include:
- A title or header
- ⸻ separator
- ROLE & OBJECTIVE
- CONTEXT & BACKGROUND
- INSTRUCTIONS / STEP-BY-STEP PROCESS
- CONSTRAINTS & QUALITY STANDARDS
- EXPECTED OUTPUT FORMAT

Make it immediately ready to copy and paste into the target AI model. Do not include conversational filler like "Sure, here is your prompt:" at the beginning or end. Output the enhanced prompt directly.
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
