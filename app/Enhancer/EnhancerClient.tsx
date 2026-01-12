"use client";

import Enhancer from "@/component/enhancer/enhancer";

export default function EnhancerClient() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Prompt Enhancer",
    description: "Enhance prompts using AI-driven optimization.",
    url: "https://promptx.co.in/Enhancer",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="bg-white dark:bg-black">
      <Enhancer />
      </div>
    </>
  );
}