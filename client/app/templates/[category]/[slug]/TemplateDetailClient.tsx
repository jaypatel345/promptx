"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import { Template, getRelatedTemplates } from "@/data/templates";
import { CopyButton } from "@/components/ui/CopyButton";
import { useUi } from "@/context/UiContext";

interface Props {
  template: Template;
  relatedTemplates: Template[];
}

export default function TemplateDetailClient({ template, relatedTemplates }: Props) {
  const { isNavOpen } = useUi();
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  // Replace variables dynamically if user customizes them
  const customizedPrompt = React.useMemo(() => {
    let result = template.prompt;
    Object.entries(variableValues).forEach(([k, v]) => {
      if (v.trim()) {
        result = result.replaceAll(k, v.trim());
      }
    });
    return result;
  }, [template.prompt, variableValues]);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 selection:bg-neutral-200 dark:selection:bg-neutral-800">
      <Header />
      <main
        className={`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 transition-all duration-300 ${
          isNavOpen ? "translate-x-70 md:translate-x-12" : "translate-x-0"
        }`}
      >
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-8 font-mono">
          <Link href="/templates" className="hover:text-neutral-900 dark:hover:text-white">
            Templates
          </Link>
          <span>/</span>
          <Link
            href={`/templates/${template.category}`}
            className="hover:text-neutral-900 dark:hover:text-white capitalize"
          >
            {template.category.replace("-", " ")}
          </Link>
          <span>/</span>
          <span className="text-neutral-900 dark:text-neutral-200 truncate">{template.title}</span>
        </nav>

        {/* Header Block */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800">
              {template.category.replace("-", " ")}
            </span>
            {template.tool.map((t) => (
              <span
                key={t}
                className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-50 dark:bg-neutral-900/60 text-neutral-500 border border-neutral-200/80 dark:border-neutral-800"
              >
                {t}
              </span>
            ))}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
            {template.title}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-3xl">
            {template.description}
          </p>
        </div>

        {/* Large Cover Visual */}
        <div className="relative aspect-16/10 sm:aspect-16/9 w-full rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-900 mb-10">
          <Image
            src={template.coverImage}
            alt={template.coverAlt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Left Column (Prompt and Variables) */}
          <div className="lg:col-span-2 space-y-8">
            {/* What this prompt is for */}
            <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                What this prompt is for
              </h2>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                This prompt is engineered to generate a dependable, high-fidelity {template.title.toLowerCase()}. It specifies the exact lighting ratios, focal characteristics, and structural constraints required so that generative models produce repeatable output on turn one without manual touch-ups.
              </p>
            </div>

            {/* Prompt Box with Copy */}
            <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Ready-to-use prompt
                </span>
                <CopyButton text={customizedPrompt} label="Copy prompt" />
              </div>

              <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 font-mono text-xs text-neutral-900 dark:text-neutral-100 whitespace-pre-wrap leading-relaxed">
                {customizedPrompt}
              </div>

              {template.tips && (
                <div className="mt-4 p-3 rounded-lg bg-neutral-100/60 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400">
                  <span className="font-semibold text-neutral-900 dark:text-neutral-200">Pro Tip: </span>
                  {template.tips}
                </div>
              )}
            </div>

            {/* Variables to Edit */}
            {template.variables.length > 0 && (
              <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                  Variables to customize
                </h2>
                <p className="text-xs text-neutral-500 mb-4">
                  Type your values below to preview and copy the populated prompt instantly:
                </p>
                <div className="space-y-3">
                  {template.variables.map((v) => (
                    <div key={v} className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <label className="font-mono text-xs font-medium text-neutral-700 dark:text-neutral-300 sm:w-44 shrink-0">
                        {v}
                      </label>
                      <input
                        type="text"
                        placeholder={`Enter ${v.replace(/[[\]]/g, "").toLowerCase()}...`}
                        value={variableValues[v] || ""}
                        onChange={(e) =>
                          setVariableValues({ ...variableValues, [v]: e.target.value })
                        }
                        className="flex-1 h-9 px-3 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 font-mono"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* CTA: Open in Builder */}
            <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40">
              <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 mb-2">
                Need more customization?
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed">
                Send this prompt structure into the PromptX builder to adjust tone, add model rules, or expand details.
              </p>
              <Link
                href="/enhancer"
                className="w-full inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg font-medium text-xs bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 transition-colors"
              >
                <span>Open in PromptX builder</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>

            {/* How to use */}
            <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
              <h3 className="font-semibold text-xs uppercase tracking-wider text-neutral-500 mb-4">
                How to use in 3 steps
              </h3>
              <ol className="space-y-3 text-xs text-neutral-600 dark:text-neutral-400">
                <li className="flex gap-2">
                  <span className="font-mono text-neutral-400 font-semibold">1.</span>
                  <span>Copy the prompt above (or fill in your custom variables).</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-mono text-neutral-400 font-semibold">2.</span>
                  <span>Open {template.tool[0]} or your preferred AI generator.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-mono text-neutral-400 font-semibold">3.</span>
                  <span>Paste into the prompt box and submit.</span>
                </li>
              </ol>
            </div>

            {/* Works with tools */}
            <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
              <h3 className="font-semibold text-xs uppercase tracking-wider text-neutral-500 mb-3">
                Works with
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {template.tool.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related Templates Section */}
        {relatedTemplates.length > 0 && (
          <div className="mt-20 pt-12 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                  Related Prompt Templates
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  More tested prompts in {template.category.replace("-", " ")} and adjacent categories.
                </p>
              </div>
              <Link
                href="/templates"
                className="text-xs font-medium text-neutral-900 dark:text-white hover:underline underline-offset-4"
              >
                All templates →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedTemplates.map((rel) => (
                <div
                  key={rel.slug}
                  className="group rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden flex flex-col justify-between hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors"
                >
                  <div>
                    <Link
                      href={`/templates/${rel.category}/${rel.slug}`}
                      className="block relative aspect-4/3 bg-neutral-900 overflow-hidden"
                    >
                      <Image
                        src={rel.coverImage}
                        alt={rel.coverAlt}
                        fill
                        sizes="(max-width: 768px) 100vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-102"
                      />
                    </Link>
                    <div className="p-4">
                      <span className="text-[10px] uppercase font-mono text-neutral-500">
                        {rel.tool[0]}
                      </span>
                      <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 mt-1 line-clamp-1">
                        <Link href={`/templates/${rel.category}/${rel.slug}`} className="hover:underline">
                          {rel.title}
                        </Link>
                      </h3>
                      <p className="text-xs text-neutral-500 line-clamp-2 mt-1 leading-relaxed">
                        {rel.description}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 pt-0 border-t border-neutral-100 dark:border-neutral-900 flex items-center justify-between mt-2">
                    <Link
                      href={`/templates/${rel.category}/${rel.slug}`}
                      className="text-xs font-medium text-neutral-700 dark:text-neutral-300"
                    >
                      View
                    </Link>
                    <CopyButton text={rel.prompt} label="Copy" size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
