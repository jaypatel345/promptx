"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useUi } from "@/context/UiContext";
import { CopyButton } from "@/components/ui/CopyButton";

export default function Herosection() {
  const { isNavOpen } = useUi();
  const [activeTab, setActiveTab] = useState<"image" | "writing">("writing");

  const exampleWritingPrompt = `Act as an expert career strategist and technical recruiter.
Goal: Write a compelling LinkedIn post announcing my first engineering internship at a high-growth tech startup.
Tone: Humble, authentic, enthusiastic, professional.
Structure:
1. Hook: The unexpected lesson learned in week one.
2. Context: The problem my team is solving and what I worked on.
3. Takeaway: 3 specific technical takeaways for other aspiring engineers.
4. Call-to-action: Ask peers what surprised them most about their first role.
Rules: Avoid hollow buzzwords (e.g. "thrilled to announce"). Keep line breaks punchy and easy to scan.`;

  const exampleImagePrompt = `Cinematic portrait of a cyberpunk robotic artisan repairing neon circuits in a rainy Tokyo alleyway, 85mm lens, f/1.8, soft teal and amber volumetric lighting, detailed rain reflections, photorealistic 8k, cinematic color grade --ar 16:9 --v 6.0`;

  return (
    <section
      className={`relative mx-auto flex flex-col items-center text-center px-4 pt-24 sm:pt-32 transition-all duration-300 max-w-4xl ${
        isNavOpen ? "translate-x-70 md:translate-x-12" : "translate-x-0"
      }`}
    >
      {/* Brand badge */}
      <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 text-[11px] text-neutral-600 dark:text-neutral-400 mb-5 select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>Prompt tool — Not a general chatbot</span>
      </div>

      {/* Main Single H1 */}
      <h1 className="text-2xl sm:text-4xl md:text-[40px] font-semibold tracking-tight text-neutral-950 dark:text-neutral-50 max-w-3xl leading-[1.2]">
        Open PromptX. Use your LLM on the side. Turn rough ideas into production-ready prompts.
      </h1>

      {/* Subheading */}
      <p className="mt-4 text-xs sm:text-sm md:text-base text-neutral-600 dark:text-neutral-400 max-w-xl leading-relaxed">
        Type a rough idea once. PromptX turns it into a complete, structured prompt. Copy it into ChatGPT, Claude, Gemini or any LLM and get better results on the first try.
      </p>

      {/* Trust line */}
      <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
        PromptX writes prompts. It does not answer questions.
      </p>

      {/* Primary and Secondary CTA Buttons */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/enhancer"
          className="inline-flex items-center gap-2 h-9 sm:h-10 px-5 rounded-lg font-medium text-xs sm:text-sm bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 transition-colors"
        >
          <span>Build my prompt</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
        <Link
          href="/templates"
          className="inline-flex items-center gap-2 h-9 sm:h-10 px-5 rounded-lg font-medium text-xs sm:text-sm border border-neutral-300 dark:border-neutral-800 bg-transparent text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
        >
          <span>Browse prompt templates</span>
        </Link>
      </div>

      {/* Split-screen visual mockup */}
      <div className="mt-10 sm:mt-12 w-full text-left">
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-950 overflow-hidden">
          {/* Header bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/50">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700"></span>
              <span className="ml-2 text-xs font-mono text-neutral-500">promptx-side-by-side-workflow</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setActiveTab("writing")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  activeTab === "writing"
                    ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                LinkedIn Task
              </button>
              <button
                onClick={() => setActiveTab("image")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  activeTab === "image"
                    ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                Image Task
              </button>
            </div>
          </div>

          {/* Side by side columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-neutral-200 dark:divide-neutral-800">
            {/* Left: PromptX side */}
            <div className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Step 1 · In PromptX
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">Rough input</span>
                </div>
                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
                  <p className="text-xs text-neutral-400 font-mono mb-2">// Describe a task, not a question</p>
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {activeTab === "writing"
                      ? `"Write a LinkedIn post about my first internship as an engineer"`
                      : `"Make a cyberpunk robot repairing lights in rainy Tokyo alleyway"`}
                  </p>
                </div>
                <p className="mt-3 text-xs text-neutral-500">
                  PromptX adds role assignment, context, structural boundaries, and tone formatting.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-900 flex items-center justify-between text-xs text-neutral-500">
                <span>Output targeted for:</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-200">
                  {activeTab === "writing" ? "ChatGPT / Claude / Gemini" : "Midjourney / DALL·E 3"}
                </span>
              </div>
            </div>

            {/* Right: LLM Side */}
            <div className="p-6 flex flex-col justify-between bg-neutral-50/30 dark:bg-neutral-950">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Step 2 · Copy & Paste to LLM
                  </span>
                  <CopyButton
                    text={activeTab === "writing" ? exampleWritingPrompt : exampleImagePrompt}
                    label="Copy ready prompt"
                  />
                </div>
                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 font-mono text-xs text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                  {activeTab === "writing" ? exampleWritingPrompt : exampleImagePrompt}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-900 flex items-center justify-between text-xs text-neutral-500">
                <span>Result in your LLM:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  Zero hallucinations · First-try accuracy
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
