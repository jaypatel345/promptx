"use client";

import React from "react";
import Link from "next/link";
import { useUi } from "@/context/UiContext";

export default function PricingTeaser() {
  const { isNavOpen } = useUi();

  return (
    <section
      className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-28 transition-all duration-300 ${
        isNavOpen ? "translate-x-70 md:translate-x-12" : "translate-x-0"
      }`}
    >
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-950 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-xl">
          <span className="text-xs font-mono uppercase tracking-wider text-neutral-500">
            Fair & Transparent
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Start building better prompts for free
          </h2>
          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Get 10 enhanced prompts daily, access our entire public template library, and copy with one click. Need unlimited generation and multi-model variations? Upgrade to Pro anytime.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-xs font-mono text-neutral-500">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Guest friendly
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              UPI & International cards
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <Link
            href="/enhancer"
            className="w-full sm:w-auto inline-flex items-center justify-center h-11 px-6 rounded-lg font-medium text-sm bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 transition-colors"
          >
            Start free
          </Link>
          <Link
            href="/pricing"
            className="w-full sm:w-auto inline-flex items-center justify-center h-11 px-6 rounded-lg font-medium text-sm border border-neutral-300 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
          >
            Compare Pro plans
          </Link>
        </div>
      </div>
    </section>
  );
}
