"use client";

import Enhancer from "@/components/enhancer/enhancer";

export default function EnhancerClient() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Prompt Enhancer",
    description:
      "Turn rough ideas into polished prompts. PromptX rewrites and structures your input for ChatGPT, Claude, Gemini, or Grok, free to try with no signup required.",
    url: "https://promptx.co.in/enhancer",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="h-screen w-full overflow-hidden bg-white dark:bg-black">
        <Enhancer />
      </div>
    </>
  );
}