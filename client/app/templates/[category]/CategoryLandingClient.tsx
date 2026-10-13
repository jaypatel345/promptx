"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import { Template, CATEGORIES, TemplateCategory } from "@/data/templates";
import { CopyButton } from "@/components/ui/CopyButton";
import { useUi } from "@/context/UiContext";

interface Props {
  category: {
    slug: TemplateCategory;
    name: string;
    description: string;
  };
  templates: Template[];
}

export default function CategoryLandingClient({ category, templates }: Props) {
  const { isNavOpen } = useUi();

  return (
    <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 selection:bg-neutral-200 dark:selection:bg-neutral-800">
      <Header />
      <main
        className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 transition-all duration-300 ${
          isNavOpen ? "translate-x-70 md:translate-x-12" : "translate-x-0"
        }`}
      >
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-8 font-mono">
          <Link href="/templates" className="hover:text-neutral-900 dark:hover:text-white">
            Templates
          </Link>
          <span>/</span>
          <span className="text-neutral-900 dark:text-neutral-200 capitalize">
            {category.name}
          </span>
        </nav>

        {/* Category Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 text-xs text-neutral-600 dark:text-neutral-400 mb-4 select-none">
            <span>Category Hub</span>
            <span className="text-neutral-400">·</span>
            <span>{templates.length} Prompts</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
            {category.name} Prompts
          </h1>
          <p className="mt-4 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {category.description} Tested prompts ready to copy and paste into ChatGPT, Midjourney, Claude, and Gemini.
          </p>
        </div>

        {/* Category selector row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-8 scrollbar-none">
          <Link
            href="/templates"
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-100 text-neutral-600 hover:text-neutral-900 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:text-white border border-neutral-200/60 dark:border-neutral-800 transition-colors"
          >
            ← All Categories
          </Link>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/templates/${cat.slug}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                cat.slug === category.slug
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "bg-neutral-100 text-neutral-600 hover:text-neutral-900 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:text-white border border-neutral-200/60 dark:border-neutral-800"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Grid of Templates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.slug}
              className="group rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden flex flex-col justify-between hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors"
            >
              <div>
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

                <div className="p-5">
                  <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
                    {template.tool.map((t) => (
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

              <div className="p-5 pt-0 border-t border-neutral-100 dark:border-neutral-900 flex items-center justify-between gap-2 mt-3">
                <Link
                  href={`/templates/${template.category}/${template.slug}`}
                  className="text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white py-1.5 px-3 rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                >
                  Use template
                </Link>
                <CopyButton text={template.prompt} label="Copy prompt" size="sm" />
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
