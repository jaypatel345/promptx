"use client";

import React from "react";
import { useUi } from "@/context/UiContext";

export default function WorksWith() {
  const { isNavOpen } = useUi();

  const models = [
    { name: "ChatGPT", role: "GPT-4o & o1 / o3", type: "LLM" },
    { name: "Claude", role: "Claude 3.5 Sonnet & Opus", type: "LLM" },
    { name: "Gemini", role: "Gemini 1.5 & 2.0 Flash/Pro", type: "LLM" },
    { name: "Midjourney", role: "v6 & Niji 6 Styles", type: "Image" },
    { name: "DALL·E 3", role: "Precision Photorealism", type: "Image" },
    { name: "Runway", role: "Gen-2 & Gen-3 Alpha", type: "Video" },
    { name: "Pika", role: "Pika 1.0 Camera Motion", type: "Video" },
    { name: "Llama & Open Models", role: "Local & Open Weights", type: "Open" },
  ];

  return (
    <section
      className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-28 transition-all duration-300 ${
        isNavOpen ? "translate-x-70 md:translate-x-12" : "translate-x-0"
      }`}
    >
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="text-xs font-mono uppercase tracking-wider text-neutral-500">
          Compatibility
        </span>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Works seamlessly with your preferred models
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
          Generate optimized prompts formatted specifically for each engine&apos;s token preferences and syntactic rules.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {models.map((m) => (
          <div
            key={m.name}
            className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                {m.name}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-900 text-neutral-500 border border-neutral-200 dark:border-neutral-800">
                {m.type}
              </span>
            </div>
            <p className="text-xs text-neutral-500 font-mono">{m.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
