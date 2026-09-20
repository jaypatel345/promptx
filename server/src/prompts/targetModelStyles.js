// Formatting conventions for the LLM the user intends to paste the enhanced
// prompt into. Each model has documented (or well-established community)
// preferences for how it tracks structure — this is appended to SYSTEM_PROMPT
// so the *output* of the enhancement is shaped for its destination, not just
// generically "good".
export const DEFAULT_TARGET_MODEL = "chatgpt";

export const TARGET_MODEL_STYLES = {
  chatgpt: {
    label: "ChatGPT",
    guidance: `
## TARGET MODEL: CHATGPT

The prompt you produce will be pasted into ChatGPT (GPT-4/4o/o-series). Shape the OUTPUT PROMPT accordingly:

- ChatGPT reads Markdown natively. Keep the ⸻ title separator and ALL CAPS section titles from the layout rules above — they render cleanly and ChatGPT tracks them well.
- Use triple-backtick code fences for any code, JSON, or literal text the model must reproduce exactly — ChatGPT treats fenced blocks as verbatim content, not prose to paraphrase.
- ChatGPT follows numbered steps precisely. For any multi-step task, prefer a numbered PROCESS section over a prose paragraph describing the same steps.
- Always state the output format as an explicit instruction ("Respond with a table with columns X, Y, Z" / "Return valid JSON matching this shape") — ChatGPT defaults to conversational prose unless told otherwise.
- ChatGPT handles long, detailed system prompts well. Do not compress detail purely for brevity.
`,
  },
  claude: {
    label: "Claude",
    guidance: `
## TARGET MODEL: CLAUDE

The prompt you produce will be pasted into Claude (Anthropic). Claude is specifically trained to track structure through XML-style tags more reliably than plain headings, so adapt the layout for it:

- In addition to (or instead of) the ALL CAPS section titles, wrap the major parts of the prompt body in lowercase, snake_case XML tags — e.g. <role>...</role>, <context>...</context>, <constraints>...</constraints>, <output_format>...</output_format>.
- Wrap any reference material, source documents, or examples the model must consult in their own <document> or <example> tags (with a name or index attribute) so Claude can cite and distinguish between them.
- If the task benefits from visible reasoning, explicitly instruct Claude to think step-by-step inside a <thinking> section before writing the final answer inside an <answer> section.
- Claude follows fully-specified natural-language sentences better than sparse keyword lists — avoid compressing instructions into fragments.
- For open-ended tasks, explicitly grant permission to ask a clarifying question when required information is missing, rather than guessing.
`,
  },
  gemini: {
    label: "Gemini",
    guidance: `
## TARGET MODEL: GEMINI

The prompt you produce will be pasted into Google Gemini. Gemini rewards concision and explicit structure over long, discursive instructions:

- Open with a single-sentence persona/role statement, then a short TASK section stating the objective in one or two sentences — don't bury the objective in later paragraphs.
- Keep every section tight. Gemini's instruction-following degrades on long, meandering system prompts — prefer short bullets over paragraphs wherever the source content allows it.
- State the output format as its own explicit, final instruction ("Output format: a markdown table with these columns…") rather than folding it into another section.
- When the task benefits from examples, include one to three concise few-shot examples — Gemini follows demonstrated patterns closely.
- Avoid stacking more than 5–6 sections; consolidate related guidance instead of splitting it across many small headers.
`,
  },
  grok: {
    label: "Grok",
    guidance: `
## TARGET MODEL: GROK

The prompt you produce will be pasted into Grok (xAI). Grok is tuned for a direct, conversational register — mirror that instead of writing formal enterprise copy:

- Write the ROLE and MISSION sections in a natural, slightly informal voice. Grok's own personality is candid and a little irreverent, and prompts that fight that tone underperform.
- Keep instructions plain and direct; avoid corporate hedging language ("endeavor to", "it is recommended that").
- Grok has access to real-time information from X — when the task involves current events or trends, explicitly instruct it to use that live context rather than assuming static knowledge.
- Humor or personality touches are fine to keep in the prompt's own voice for non-formal tasks (writing, social content) — don't sanitize them out.
- Casual tone doesn't mean unstructured: still keep clear sections and an explicit output-format instruction.
`,
  },
};

// Falls back to the default whenever the requested id isn't one we have
// tailoring guidance for, so an unrecognized/stale value degrades to a
// sane, still-correct default rather than sending no guidance at all.
export function resolveTargetModel(id) {
  if (typeof id === "string" && TARGET_MODEL_STYLES[id]) {
    return id;
  }

  return DEFAULT_TARGET_MODEL;
}

export function getTargetModelGuidance(id) {
  return TARGET_MODEL_STYLES[resolveTargetModel(id)];
}
