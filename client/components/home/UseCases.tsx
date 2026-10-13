"use client";

import React from "react";
import Link from "next/link";
import { useUi } from "@/context/UiContext";

export default function UseCases() {
  const { isNavOpen } = useUi();

  const cases = [
    {
      title: "Image Generation",
      tag: "Midjourney & DALL·E",
      desc: "Lenses, lighting ratios, camera angles, color palettes, and negative prompt boundaries for stunning visual fidelity.",
      href: "/templates/image-generation",
    },
    {
      title: "Video & Reels",
      tag: "Runway, Sora & Pika",
      desc: "Scene-by-scene script hooks, voiceover pacing, camera motion vectors, and visual transition descriptions.",
      href: "/templates/video",
    },
    {
      title: "LinkedIn & Career",
      tag: "Thought Leadership",
      desc: "Executive tone, hook formulas, narrative arcs, and resume bullets that bypass applicant tracking algorithms.",
      href: "/templates/career",
    },
    {
      title: "Learning & Tutoring",
      tag: "Socratic Method",
      desc: "Turn models into patient, step-by-step mentors that explain complex engineering, math, and data concepts.",
      href: "/templates/learning",
    },
    {
      title: "Coding & Engineering",
      tag: "Production Code",
      desc: "Architecture trade-offs, bug reproduction steps, refactoring constraints, and unit test generators.",
      href: "/templates/coding",
    },
    {
      title: "Business & Strategy",
      tag: "C-Suite & Startups",
      desc: "Executive decision memos, competitive teardowns, user research questions, and launch email sequences.",
      href: "/templates/business",
    },
  ];

  return (
    <section
      className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-28 transition-all duration-300 ${
        isNavOpen ? "translate-x-70 md:translate-x-12" : "translate-x-0"
      }`}
    >
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="text-xs font-mono uppercase tracking-wider text-neutral-500">
          Versatility
        </span>
        <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Built for every high-stakes prompt workflow
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
          Tailored structures designed for what people actually generate most.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cases.map((c) => (
          <Link
            key={c.title}
            href={c.href}
            className="group p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex flex-col justify-between hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono text-neutral-500">{c.tag}</span>
                <span className="text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                  →
                </span>
              </div>
              <h3 className="font-semibold text-base text-neutral-900 dark:text-neutral-100 mb-2">
                {c.title}
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {c.desc}
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-neutral-100 dark:border-neutral-900 text-[11px] font-medium text-neutral-700 dark:text-neutral-300">
              Explore templates
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
