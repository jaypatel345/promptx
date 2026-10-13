"use client";

import React from "react";
import Link from "next/link";
import { useUi } from "@/context/UiContext";

export default function FinalCta() {
  const { isNavOpen } = useUi();

  return (
    <section
      className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-28 mb-12 transition-all duration-300 ${
        isNavOpen ? "translate-x-70 md:translate-x-12" : "translate-x-0"
      }`}
    >
      <div className="text-center p-10 sm:p-16 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40">
        <span className="text-xs font-mono uppercase tracking-wider text-neutral-500">
          Get Started
        </span>
        <h2 className="mt-3 text-2xl sm:text-4xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 max-w-2xl mx-auto leading-tight">
          Turn one rough idea into a complete, ready-to-paste prompt.
        </h2>
        <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto">
          Keep PromptX open on one side and your favorite AI assistant on the other. Get better results on the first try.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/enhancer"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-lg font-medium text-sm bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 transition-colors"
          >
            <span>Build my prompt</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
          <Link
            href="/templates"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-lg font-medium text-sm border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
          >
            <span>Browse prompt templates</span>
          </Link>
        </div>

        <p className="mt-4 text-xs font-medium text-neutral-500">
          PromptX writes prompts. It does not answer questions.
        </p>
      </div>
    </section>
  );
}
