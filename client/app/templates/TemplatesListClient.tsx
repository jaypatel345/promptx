"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import { TEMPLATES, CATEGORIES, TemplateCategory } from "@/data/templates";
import { CopyButton } from "@/components/ui/CopyButton";
import { useUi } from "@/context/UiContext";

export default function TemplatesListClient() {
  const { isNavOpen } = useUi();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter((template) => {
      const matchesCategory =
        selectedCategory === "all" || template.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tool.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 selection:bg-neutral-200 dark:selection:bg-neutral-800">
      <Header />
      <main
        className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 transition-all duration-300 ${
          isNavOpen ? "translate-x-70 md:translate-x-12" : "translate-x-0"
        }`}
      >
        {/* Page Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 text-xs text-neutral-600 dark:text-neutral-400 mb-4 select-none">
            <span>Template Library</span>
            <span className="text-neutral-400">·</span>
            <span>{TEMPLATES.length} Curated Prompts</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
            Prompt Templates
          </h1>
          <p className="mt-4 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Copy-and-paste prompt architectures rigorously tested on Midjourney, ChatGPT, Claude, and Gemini. Choose a template, customize the bracketed variables, and paste into your model.
          </p>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="space-y-4 mb-10">
          {/* Search bar */}
          <div className="relative max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates, models, or styles..."
              className="w-full h-10 pl-9 pr-4 text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors"
            />
            <svg
              className="w-4 h-4 absolute left-3 top-3 text-neutral-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 font-mono"
              >
                esc
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "bg-neutral-100 text-neutral-600 hover:text-neutral-900 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:text-white border border-neutral-200/60 dark:border-neutral-800"
              }`}
            >
              All Templates ({TEMPLATES.length})
            </button>
            {CATEGORIES.map((cat) => {
              const count = TEMPLATES.filter((t) => t.category === cat.slug).length;
              return (
                <button
                  key={cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat.slug
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                      : "bg-neutral-100 text-neutral-600 hover:text-neutral-900 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:text-white border border-neutral-200/60 dark:border-neutral-800"
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
            <p className="text-sm text-neutral-500">No prompt templates found matching &quot;{searchQuery}&quot;.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="mt-3 text-xs font-medium text-neutral-900 dark:text-white underline underline-offset-4"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div
                key={template.slug}
                className="group rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden flex flex-col justify-between hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors"
              >
                <div>
                  {/* Cover preview (4:3 aspect ratio, WebP/SVG lazy loaded) */}
                  <Link
                    href={`/templates/${template.category}/${template.slug}`}
                    className="block relative aspect-4/3 bg-neutral-900 overflow-hidden"
                  >
                    <Image
                      src={template.coverImage}
                      alt={template.coverAlt}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-102"
                      loading="lazy"
                    />
                  </Link>

                  {/* Body Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
                      <Link
                        href={`/templates/${template.category}`}
                        className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 hover:text-neutral-900 dark:hover:text-white"
                      >
                        {template.category.replace("-", " ")}
                      </Link>
                      {template.tool.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] text-neutral-400 font-mono"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <h2 className="font-semibold text-base text-neutral-900 dark:text-neutral-100">
                      <Link
                        href={`/templates/${template.category}/${template.slug}`}
                        className="hover:underline"
                      >
                        {template.title}
                      </Link>
                    </h2>

                    <p className="mt-1.5 text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                      {template.description}
                    </p>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-5 pt-0 border-t border-neutral-100 dark:border-neutral-900 flex items-center justify-between gap-2 mt-3">
                  <Link
                    href={`/templates/${template.category}/${template.slug}`}
                    className="text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white py-1.5 px-3 rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                  >
                    Use this template
                  </Link>
                  <CopyButton text={template.prompt} label="Copy prompt" size="sm" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
