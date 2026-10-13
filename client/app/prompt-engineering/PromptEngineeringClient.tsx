"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import { CopyButton } from "@/components/ui/CopyButton";
import { useUi } from "@/context/UiContext";
import { PE_FAQS } from "@/data/faq";

export default function PromptEngineeringClient() {
  const { isNavOpen } = useUi();
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const tocItems = [
    { id: "what-is-prompt-engineering", label: "1. What is prompt engineering?" },
    { id: "the-6-parts-of-a-good-prompt", label: "2. The 6 parts of a good prompt" },
    { id: "prompt-engineering-techniques", label: "3. Core prompting techniques" },
    { id: "before-and-after-examples", label: "4. Before and after examples" },
    { id: "image-and-video-prompts", label: "5. Prompt engineering for images & video" },
    { id: "common-mistakes", label: "6. Common prompt mistakes" },
    { id: "examples-by-use-case", label: "7. Prompt examples by use case" },
    { id: "faq", label: "8. Frequently asked questions" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 selection:bg-neutral-200 dark:selection:bg-neutral-800">
      <Header />
      <main
        className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 transition-all duration-300 ${
          isNavOpen ? "translate-x-70 md:translate-x-12" : "translate-x-0"
        }`}
      >
        {/* Header Section */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 text-xs text-neutral-600 dark:text-neutral-400 mb-4 select-none font-mono">
            <span>Pillar Guide</span>
            <span>·</span>
            <span>Updated March 2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50 leading-[1.15]">
            Prompt Engineering: A Practical Guide to Writing Better Prompts
          </h1>

          <p className="mt-6 text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Prompt engineering is the practice of structuring inputs so large language models and generative tools deliver predictable, high-accuracy results on turn one. Instead of hoping a model guesses your intent, you give it the constraints, context, and format it needs to succeed.
          </p>

          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Whether you are writing code with Claude, drafting executive communications in ChatGPT, or generating photorealistic visuals in Midjourney, mastering prompt structure eliminates repetitive iteration loops. Want to skip the manual formatting? You can also{" "}
            <Link href="/enhancer" className="text-neutral-900 dark:text-white font-medium underline underline-offset-4">
              let PromptX build your prompts automatically
            </Link>
            .
          </p>
        </div>

        {/* Content Layout with Sticky Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Article Body (8 cols) */}
          <article className="lg:col-span-8 space-y-16 text-neutral-800 dark:text-neutral-200 text-sm sm:text-base leading-relaxed">
            {/* Table of contents (Mobile & Desktop inline) */}
            <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950">
              <h2 className="text-xs font-mono uppercase tracking-wider text-neutral-500 mb-3 font-semibold">
                Table of Contents
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium">
                {tocItems.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      <span>{item.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Section 1: What is prompt engineering? */}
            <section id="what-is-prompt-engineering" className="scroll-mt-28 space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
                1. What is prompt engineering?
              </h2>
              <p>
                At its core, prompt engineering is the deliberate design of instructions fed into generative models. Modern transformer models—such as GPT-4o, Claude 3.5 Sonnet, and Gemini 2.0—are probability engines trained on vast corpuses of text and code. When you send a single vague sentence like &quot;write a blog post about databases&quot;, the model has to choose from millions of possible directions, tones, technical depths, and lengths.
              </p>
              <p>
                The inevitable result of ambiguity is mediocrity. The model defaults to the most statistical average response: generic corporate bullet points, repetitive transitions, and shallow insights.
              </p>
              <p>
                Prompt engineering narrows that probability distribution. By explicitly establishing the persona, mission, operational constraints, and expected output format, you force the AI to simulate an expert practitioner operating within tight professional boundaries.
              </p>
            </section>

            {/* Section 2: The 6 parts of a good prompt */}
            <section id="the-6-parts-of-a-good-prompt" className="scroll-mt-28 space-y-6">
              <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
                2. The 6 parts of a good prompt
              </h2>
              <p>
                Every dependable prompt created in PromptX follows a modular 6-part framework:
              </p>

              <div className="space-y-4">
                <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 font-semibold">
                      Part 1
                    </span>
                    <h3 className="font-semibold text-base text-neutral-900 dark:text-white">Role</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                    Who is the AI acting as? Grounding the model in an explicit identity (e.g. &quot;Senior Distributed Systems Architect&quot; or &quot;Direct-response copywriter&quot;) primes the appropriate vocabulary and analytical depth.
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 font-semibold">
                      Part 2
                    </span>
                    <h3 className="font-semibold text-base text-neutral-900 dark:text-white">Mission</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                    What is the exact outcome? Define the primary objective in one unambiguous sentence. Avoid combining five conflicting goals into a single prompt.
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 font-semibold">
                      Part 3
                    </span>
                    <h3 className="font-semibold text-base text-neutral-900 dark:text-white">Context</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                    What background does the model need to know? Include audience seniority, existing tech stack, historical attempts, and the problem&apos;s urgency.
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 font-semibold">
                      Part 4
                    </span>
                    <h3 className="font-semibold text-base text-neutral-900 dark:text-white">Rules & Constraints</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                    What must the AI NOT do? Negative constraints prevent unwanted clichés, excessive conversational filler, or deprecated API methods.
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 font-semibold">
                      Part 5
                    </span>
                    <h3 className="font-semibold text-base text-neutral-900 dark:text-white">Format</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                    How should the output look? Specify markdown tables, JSON schemas, numbered steps, code fences, or executive summaries.
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 font-semibold">
                      Part 6
                    </span>
                    <h3 className="font-semibold text-base text-neutral-900 dark:text-white">Examples (Few-Shot)</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                    Provide 1-2 examples of ideal inputs and outputs. Demonstrating the target style is 10x more reliable than describing it abstractly.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3: Prompt engineering techniques */}
            <section id="prompt-engineering-techniques" className="scroll-mt-28 space-y-6">
              <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
                3. Essential prompting techniques
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                    Zero-Shot vs. Few-Shot Prompting
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-3">
                    Zero-shot prompting asks the model to execute a task with zero prior demonstrations. Few-shot prompting provides 2 or 3 curated input/output pairs. Use few-shot whenever you need strict schema adherence or unique brand styling.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                    Chain-of-Thought (CoT) Prompting
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-3">
                    When solving math, code logic, or systems architecture, instruct the AI to show its working: &quot;Before providing the final answer, outline your internal reasoning step by step inside an analysis block.&quot; This prevents premature token generation errors.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                    Role & Persona Anchoring
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-3">
                    Rather than saying &quot;You are helpful&quot;, say &quot;You are an Staff Software Engineer conducting a strict security review of pull requests&quot;. The model shifts its judgment from polite affirmation to critical scrutiny.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                    Boundary Constraints
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Always bound the length and tone. Without rules like &quot;Maximum 200 words&quot; or &quot;Do not include preamble or conversational filler&quot;, LLMs generate conversational fluff that degrades developer velocity.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4: Before and after examples */}
            <section id="before-and-after-examples" className="scroll-mt-28 space-y-6">
              <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
                4. Before & After: Real PromptX transformations
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                Notice how rough, unformed thoughts become structured, execution-ready prompts:
              </p>

              {/* Example 1 */}
              <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 bg-neutral-50/50 dark:bg-neutral-950 space-y-3">
                <span className="text-xs font-mono uppercase text-neutral-500 font-semibold">Example 1 · Coding</span>
                <div className="text-xs font-mono p-3 rounded bg-red-50/40 dark:bg-red-950/20 border border-red-200/40 dark:border-red-900/40 text-neutral-800 dark:text-neutral-300">
                  <span className="text-red-600 dark:text-red-400 font-bold block mb-1">Rough:</span>
                  &quot;fix my react performance bug&quot;
                </div>
                <div className="text-xs font-mono p-3 rounded bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/40 dark:border-emerald-900/40 text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">PromptX Structured:</span>
                    <CopyButton text={`Act as a React performance specialist. Analyze this component: [CODE]. Identify root causes of unnecessary re-renders (state colocation, missing memoization, uncurried event handlers). Provide optimized code with before/after render profiling estimates.`} size="sm" />
                  </div>
Act as a React performance specialist.
Analyze this component: [CODE].
1. Identify root causes of unnecessary re-renders (state colocation, memoization, uncurried handlers).
2. Provide refactored code with explanatory comments.
3. Include before/after render profiling estimates.
                </div>
              </div>

              {/* Example 2 */}
              <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 bg-neutral-50/50 dark:bg-neutral-950 space-y-3">
                <span className="text-xs font-mono uppercase text-neutral-500 font-semibold">Example 2 · Image Generation</span>
                <div className="text-xs font-mono p-3 rounded bg-red-50/40 dark:bg-red-950/20 border border-red-200/40 dark:border-red-900/40 text-neutral-800 dark:text-neutral-300">
                  <span className="text-red-600 dark:text-red-400 font-bold block mb-1">Rough:</span>
                  &quot;picture of a cool coffee cup&quot;
                </div>
                <div className="text-xs font-mono p-3 rounded bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/40 dark:border-emerald-900/40 text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">PromptX Structured:</span>
                    <CopyButton text={`Studio product photography of an artisanal ceramic espresso cup on a raw concrete surface, soft morning window light, subtle steam rising, minimal shadows, Hasselblad H6D-100c, 100mm macro lens, ultra-sharp detail --ar 4:5 --v 6.0`} size="sm" />
                  </div>
Studio product photography of an artisanal ceramic espresso cup on a raw concrete surface, soft morning window light, subtle steam rising, minimal shadows, Hasselblad H6D-100c, 100mm macro lens, ultra-sharp detail --ar 4:5 --v 6.0
                </div>
              </div>
            </section>

            {/* Section 5: Image and video prompts */}
            <section id="image-and-video-prompts" className="scroll-mt-28 space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
                5. Prompt engineering for images and video
              </h2>
              <p>
                Visual diffusion models (Midjourney, DALL·E 3, Stable Diffusion) and video engines (Runway, Pika, Sora) parse prompts differently than conversational LLMs. Instead of paragraphs, they favor comma-separated visual tags arranged in order of prominence:
              </p>
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 font-mono text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                [Core Subject] + [Medium / Camera] + [Lighting & Environment] + [Color Palette] + [Parameters: --ar, --v, --style]
              </div>
              <p>
                Explore our curated collection of{" "}
                <Link href="/templates/image-generation" className="text-neutral-900 dark:text-white font-medium underline underline-offset-4">
                  20+ AI Image Generation Prompts
                </Link>{" "}
                including cinematic portraits, product shots, anime styles, and UI renders.
              </p>
            </section>

            {/* Section 6: Common mistakes */}
            <section id="common-mistakes" className="scroll-mt-28 space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
                6. Common prompt engineering mistakes
              </h2>
              <ul className="space-y-3">
                <li className="flex gap-2">
                  <span className="text-red-500 font-bold">✕</span>
                  <span><strong>Asking a question instead of describing a task:</strong> &quot;How do I do marketing?&quot; creates an encyclopedia entry. &quot;Draft a 30-day organic growth plan for a B2B SaaS startup targeting CTOs&quot; creates an executable roadmap.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-500 font-bold">✕</span>
                  <span><strong>Overloading a single prompt:</strong> Asking for research, analysis, email copy, and code in one breath leads to truncated, shallow answers. Chain prompts across turns instead.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-500 font-bold">✕</span>
                  <span><strong>Vague adjectives:</strong> Words like &quot;good&quot;, &quot;high quality&quot;, or &quot;interesting&quot; have no semantic anchor. Use concrete specs: &quot;written for a Staff Engineer&quot;, &quot;under 200 words&quot;, or &quot;in strict JSON&quot;.</span>
                </li>
              </ul>
            </section>

            {/* Section 7: Examples by use case */}
            <section id="examples-by-use-case" className="scroll-mt-28 space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
                7. Explore prompts by category
              </h2>
              <p>
                Browse ready-to-paste templates across key disciplines:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Link href="/templates/image-generation" className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors">
                  <h4 className="font-semibold text-neutral-900 dark:text-white text-sm">Image Generation Prompts →</h4>
                  <p className="text-xs text-neutral-500 mt-1">Midjourney portraits, product shots, 3D Pixar, cyberpunk.</p>
                </Link>
                <Link href="/templates/video" className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors">
                  <h4 className="font-semibold text-neutral-900 dark:text-white text-sm">Video & Reels Prompts →</h4>
                  <p className="text-xs text-neutral-500 mt-1">Short-form retention hooks, scene storyboards, YouTube scripts.</p>
                </Link>
                <Link href="/templates/career" className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors">
                  <h4 className="font-semibold text-neutral-900 dark:text-white text-sm">Career & LinkedIn Prompts →</h4>
                  <p className="text-xs text-neutral-500 mt-1">Thought leadership posts, resumes, executive interview prep.</p>
                </Link>
                <Link href="/templates/coding" className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors">
                  <h4 className="font-semibold text-neutral-900 dark:text-white text-sm">Coding & Engineering Prompts →</h4>
                  <p className="text-xs text-neutral-500 mt-1">Refactoring, architecture trade-offs, unit tests.</p>
                </Link>
              </div>
            </section>

            {/* Section 8: FAQ */}
            <section id="faq" className="scroll-mt-28 space-y-6">
              <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
                8. Frequently Asked Questions
              </h2>
              <div className="space-y-3">
                {PE_FAQS.map((item, idx) => (
                  <div
                    key={item.question}
                    className="border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-950 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                      className="w-full p-4 text-left flex items-center justify-between gap-4 cursor-pointer"
                    >
                      <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {item.question}
                      </span>
                      <span className="text-neutral-400 font-mono text-xs">
                        {activeFaq === idx ? "−" : "+"}
                      </span>
                    </button>
                    {activeFaq === idx && (
                      <div className="px-4 pb-4 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed border-t border-neutral-100 dark:border-neutral-900 pt-3">
                        {item.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </article>

          {/* Sticky Sidebar (4 cols) */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="sticky top-28 space-y-6">
              {/* Skip learning curve box */}
              <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                <span className="text-xs font-mono uppercase tracking-wider text-neutral-500">
                  Instant Tool
                </span>
                <h3 className="mt-2 text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  Skip the learning curve
                </h3>
                <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  You do not need to memorize prompting syntax. Type your rough idea into PromptX once, and we will structure the role, constraints, and output for you.
                </p>
                <Link
                  href="/enhancer"
                  className="mt-5 w-full inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg font-medium text-xs bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 transition-colors"
                >
                  <span>Build my prompt now</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>

              {/* Browse Templates link */}
              <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
                <h4 className="font-semibold text-xs uppercase tracking-wider text-neutral-500 mb-2">
                  Tested Prompts
                </h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                  Browse over 25 copy-ready templates formatted for Midjourney, ChatGPT, and Claude.
                </p>
                <Link
                  href="/templates"
                  className="text-xs font-medium text-neutral-900 dark:text-white underline underline-offset-4"
                >
                  Browse template library →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
