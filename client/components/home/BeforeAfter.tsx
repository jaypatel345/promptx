"use client";

import React, { useState } from "react";
import { useUi } from "@/context/UiContext";
import { CopyButton } from "@/components/ui/CopyButton";

export default function BeforeAfter() {
  const { isNavOpen } = useUi();
  const [selectedExample, setSelectedExample] = useState<0 | 1>(0);

  const examples = [
    {
      title: "Cartoon character concept",
      tag: "Image generation",
      before: `make a cartoon`,
      beforeProblem: "Produces generic, inconsistent, low-detail clipart with bad proportions.",
      after: `3D animated Pixar-style concept character of an inquisitive young botanist surrounded by glowing greenhouse plants.
Style details: Expressive wide eyes, soft global illumination, tactile knit sweater texture, volumetric dust motes in golden light.
Palette: Emerald green, warm terracotta, soft sunlight yellow.
Camera: 50mm portrait lens, shallow depth of field, sharp subject focus.
Output tags: --ar 16:9 --v 6.0 --style raw`,
      afterBenefit: "Delivers production-grade character art matching modern feature film aesthetics on turn one.",
    },
    {
      title: "Executive update email",
      tag: "Business communication",
      before: `write an email to my boss about project delay`,
      beforeProblem: "Sounds overly apologetic, defensive, or vague on next steps and timeline.",
      after: `Act as a senior engineering director.
Draft a concise, solution-oriented project update email to the VP of Product.
Context:
- The Q3 analytics dashboard launch is moving from Friday Oct 18 to Tuesday Oct 22.
- Root cause: Late edge-case latency bugs detected in load testing.
- Fix in progress: Query indexing optimization completed, regression tests running over the weekend.
Tone: Calm, accountable, executive-ready.
Constraints: Max 150 words. Use 3 scannable bullet points for impact, action taken, and new release schedule. No excuses.`,
      afterBenefit: "Protects credibility, clearly outlines actions, and respects executive reading time.",
    },
  ];

  const current = examples[selectedExample];

  return (
    <section
      className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-28 transition-all duration-300 ${
        isNavOpen ? "translate-x-70 md:translate-x-12" : "translate-x-0"
      }`}
    >
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs font-mono uppercase tracking-wider text-neutral-500">
          Side-by-side comparison
        </span>
        <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          The difference a prompt builder makes
        </h2>
        <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
          Vague instructions produce shallow results. PromptX provides the depth models need.
        </p>

        {/* Switcher pills */}
        <div className="mt-6 inline-flex p-1 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
          {examples.map((ex, idx) => (
            <button
              key={ex.title}
              onClick={() => setSelectedExample(idx as 0 | 1)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                selectedExample === idx
                  ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs border border-neutral-200/80 dark:border-neutral-700/80"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              {ex.title}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Before */}
        <div className="p-6 rounded-xl border border-red-200/60 dark:border-red-950/60 bg-red-50/20 dark:bg-red-950/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                Before PromptX (Rough input)
              </span>
              <span className="text-[11px] font-mono text-neutral-500">Weak response</span>
            </div>
            <div className="p-4 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 font-mono text-xs text-neutral-800 dark:text-neutral-200">
              &quot;{current.before}&quot;
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-red-100 dark:border-red-950 text-xs text-neutral-600 dark:text-neutral-400">
            <span className="font-medium text-red-700 dark:text-red-400">Why it fails: </span>
            {current.beforeProblem}
          </div>
        </div>

        {/* After */}
        <div className="p-6 rounded-xl border border-emerald-200/60 dark:border-emerald-950/60 bg-emerald-50/20 dark:bg-emerald-950/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                After PromptX (Optimized prompt)
              </span>
              <CopyButton text={current.after} label="Copy prompt" />
            </div>
            <div className="p-4 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 font-mono text-xs text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
              {current.after}
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-emerald-100 dark:border-emerald-950 text-xs text-neutral-600 dark:text-neutral-400">
            <span className="font-medium text-emerald-700 dark:text-emerald-400">What you get: </span>
            {current.afterBenefit}
          </div>
        </div>
      </div>
    </section>
  );
}
