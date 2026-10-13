"use client";

import React, { useState } from "react";
import { useUi } from "@/context/UiContext";
import { FAQ_ITEMS } from "@/data/faq";

export default function Faq() {
  const { isNavOpen } = useUi();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section
      className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-28 transition-all duration-300 ${
        isNavOpen ? "translate-x-70 md:translate-x-12" : "translate-x-0"
      }`}
    >
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="text-xs font-mono uppercase tracking-wider text-neutral-500">
          FAQ
        </span>
        <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Frequently asked questions
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
          Everything you need to know about PromptX and prompt generation.
        </p>
      </div>

      <div className="space-y-3">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={item.question}
              className="border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-950 overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer select-none"
              >
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {item.question}
                </span>
                <span className="text-neutral-400 shrink-0 font-mono text-sm">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pt-0 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed border-t border-neutral-100 dark:border-neutral-900 pt-3">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
