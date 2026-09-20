"use client";
import { useUi } from "@/context/UiContext";
import { motion } from "framer-motion";

const FAQS = [
  {
    question: "What is PromptX?",
    answer:
      "PromptX is an AI prompt enhancer that turns rough, unclear prompts into polished, structured instructions optimized for large language models like ChatGPT, Claude, Gemini, and Grok. Instead of guessing why a model gave a mediocre answer, you describe what you want in plain language and PromptX rewrites it into a prompt that gets clearer, more consistent results the first time.",
  },
  {
    question: "How does PromptX work?",
    answer:
      "Type a request — anything from \"write me a prompt for a fitness coach\" to \"help me plan a marketing campaign\" — and PromptX analyzes your intent, then produces a ready-to-use prompt with clear role definitions, context, constraints, and an output format. You choose which model you plan to paste the result into, and PromptX adjusts the structure to match that model's own conventions.",
  },
  {
    question: "Which AI models does PromptX support?",
    answer:
      "PromptX tailors the prompts it generates for ChatGPT, Claude, Gemini, and Grok. Pick your target model from the dropdown next to the message box, and the enhanced prompt follows that model's best practices — a prompt written for Claude often benefits from a different structure than one written for ChatGPT, even when the underlying task is identical.",
  },
  {
    question: "Do I need to create an account?",
    answer:
      "No. PromptX works instantly for guests — open the app and start chatting right away. Your conversation history is saved so you can pick up where you left off, and you can create a free account later if you want that history to sync across devices.",
  },
  {
    question: "Is PromptX free to use?",
    answer:
      "Yes, PromptX is free to start. Paid plans add higher usage limits and team features for people who use prompt enhancement as part of their daily workflow — see Pricing for details.",
  },
  {
    question: "What kinds of prompts can PromptX help with?",
    answer:
      "PromptX handles everything from a single one-off prompt rewrite to full reusable system prompts you can save and reuse — for writing, coding, research, business strategy, education, and creative projects. If you're building a recurring workflow, like a content calendar, a code-review assistant, or a research summarizer, PromptX can generate a complete system-style prompt rather than just a one-line rewrite.",
  },
  {
    question: "Does PromptX keep my prompts private?",
    answer:
      "Yes. Guest conversations are scoped to your browser and never shared, and if you sign in, your history is tied only to your account. PromptX doesn't sell your prompts or use them to train third-party models.",
  },
  {
    question: "Can I reuse the prompts PromptX creates?",
    answer:
      "Yes. Every enhanced prompt is yours to save, edit, and reuse as many times as you like — whether that's a one-off rewrite for today's task or a reusable system prompt you plan to paste into a new conversation every week.",
  },
];

export default function Faq() {
  const { isNavOpen } = useUi();

  return (
    <section
      className={`relative w-full lg:max-w-6xl mx-auto mt-32 sm:mt-40 px-4 sm:px-6 lg:px-0 transition-all duration-300 dark:bg-black dark:text-white ${
        isNavOpen ? "translate-x-70 md:translate-x-12" : "translate-x-0"
      }`}
    >
      <div className="absolute top-0 left-0 w-full h-[1.5px] bg-linear-to-r from-transparent via-gray-300 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.3 }}
        className="pt-24 sm:pt-30"
      >
        <h2 className="text-3xl sm:text-4xl font-medium text-center mb-3">
          Frequently asked questions
        </h2>
        <p className="text-gray-500 text-sm sm:text-base text-center max-w-xl mx-auto mb-12">
          Everything you need to know about enhancing prompts with PromptX.
        </p>

        <div className="max-w-2xl mx-auto divide-y divide-gray-200 dark:divide-neutral-800">
          {FAQS.map((item) => (
            <div key={item.question} className="py-5">
              <h3 className="font-medium text-base sm:text-lg mb-2">
                {item.question}
              </h3>
              <p className="text-sm sm:text-[15px] leading-relaxed text-gray-600 dark:text-gray-400">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
