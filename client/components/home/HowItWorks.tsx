"use client";

import React from "react";
import { useUi } from "@/context/UiContext";

export default function HowItWorks() {
  const { isNavOpen } = useUi();

  const steps = [
    {
      num: "01",
      title: "Type your rough idea",
      description:
        "Describe the task you want an AI to perform in plain, natural language. Tell PromptX what you need—no special syntax needed.",
      detail: 'Example: "Explain transformer attention to a junior dev with code"',
    },
    {
      num: "02",
      title: "Copy the finished prompt",
      description:
        "PromptX restructures your input with role assignment, clear constraints, output schema, and reasoning guidelines in under 2 seconds.",
      detail: "One-click copy straight to your clipboard.",
    },
    {
      num: "03",
      title: "Paste into your LLM",
      description:
        "Switch over to ChatGPT, Claude, Gemini, or Midjourney. Paste and execute. Get the exact result you wanted on turn one without back-and-forth prompt gymnastics.",
      detail: "Works side-by-side with every top model.",
    },
  ];

  return (
    <section
      className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-28 transition-all duration-300 ${
        isNavOpen ? "translate-x-70 md:translate-x-12" : "translate-x-0"
      }`}
    >
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-xs font-mono uppercase tracking-wider text-neutral-500">
          Workflow
        </span>
        <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          How it works in 3 steps
        </h2>
        <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
          PromptX sits alongside your favorite AI apps as your prompt engineering copilot.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step) => (
          <div
            key={step.num}
            className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-xs font-medium px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800">
                  Step {step.num}
                </span>
                <span className="text-xs text-neutral-400 font-mono">Simple & fast</span>
              </div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                {step.title}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {step.description}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-900 text-[11px] font-mono text-neutral-500">
              {step.detail}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
