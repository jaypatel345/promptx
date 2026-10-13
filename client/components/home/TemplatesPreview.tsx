"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { TEMPLATES } from "@/data/templates";
import { CopyButton } from "@/components/ui/CopyButton";
import { useUi } from "@/context/UiContext";

export default function TemplatesPreview() {
  const { isNavOpen } = useUi();
  // Pick 6 high-impact templates as preview
  const previewTemplates = TEMPLATES.slice(0, 6);

  return (
    <section
      className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-28 transition-all duration-300 ${
        isNavOpen ? "translate-x-70 md:translate-x-12" : "translate-x-0"
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-neutral-500">
            Pre-built prompts
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Featured prompt templates
          </h2>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 max-w-xl">
            Tested, production-ready prompts designed for image generators, writing assistants, and creative workflows.
          </p>
        </div>
        <Link
          href="/templates"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-900 dark:text-white hover:underline underline-offset-4 select-none shrink-0"
        >
          <span>View all {TEMPLATES.length} templates</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {previewTemplates.map((template) => (
          <div
            key={template.slug}
            className="group rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden flex flex-col justify-between hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors"
          >
            <div>
              {/* Cover preview */}
              <Link href={`/templates/${template.category}/${template.slug}`} className="block relative aspect-4/3 bg-neutral-900 overflow-hidden">
                <Image
                  src={template.coverImage}
                  alt={template.coverAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-102"
                />
              </Link>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800">
                    {template.category.replace("-", " ")}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    {template.tool[0]}
                  </span>
                </div>
                <h3 className="font-semibold text-base text-neutral-900 dark:text-neutral-100">
                  <Link href={`/templates/${template.category}/${template.slug}`} className="hover:underline">
                    {template.title}
                  </Link>
                </h3>
                <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                  {template.description}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="p-5 pt-0 border-t border-neutral-100 dark:border-neutral-900 flex items-center justify-between gap-2 mt-2">
              <Link
                href={`/templates/${template.category}/${template.slug}`}
                className="text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white"
              >
                Use template
              </Link>
              <CopyButton text={template.prompt} label="Copy" size="sm" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
