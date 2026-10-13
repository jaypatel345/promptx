"use client";

import { useUi } from "@/context/UiContext";
import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const { isNavOpen } = useUi();

  return (
    <footer
      className={`relative w-full max-w-6xl mx-auto mt-24 px-4 sm:px-6 lg:px-8 pb-16 text-xs text-neutral-600 dark:text-neutral-400 transition-all duration-300 border-t border-neutral-200 dark:border-neutral-800 ${
        isNavOpen ? "translate-x-70 md:translate-x-12" : "translate-x-0"
      }`}
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-8 pt-12">
        {/* Brand column: Standalone logo icon */}
        <div className="col-span-2 sm:col-span-4 lg:col-span-1">
          <Link href="/" aria-label="PromptX Home" className="inline-flex items-center transition-opacity hover:opacity-90">
            <Image
              src="/promptx-logo-black.png"
              width={20}
              height={20}
              alt="PromptX logo"
              style={{ width: "auto" }}
              className="h-5 object-contain dark:hidden"
            />
            <Image
              src="/promptx-logo-white.png"
              width={20}
              height={20}
              alt="PromptX logo"
              style={{ width: "auto" }}
              className="h-5 object-contain hidden dark:block"
            />
          </Link>
          <p className="mt-2 text-neutral-500 dark:text-neutral-500 text-xs leading-relaxed max-w-xs">
            Turn rough ideas into complete, structured prompts for ChatGPT, Claude, Gemini, and image generators.
          </p>
        </div>

        {/* Product column */}
        <div>
          <h4 className="font-medium text-neutral-900 dark:text-neutral-200 mb-3 text-xs tracking-wider uppercase">
            Product
          </h4>
          <ul className="space-y-2">
            <li>
              <Link href="/enhancer" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                Prompt Builder
              </Link>
            </li>
            <li>
              <Link href="/templates" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                Prompt Templates
              </Link>
            </li>
            <li>
              <Link href="/templates/image-generation" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                Image Prompts
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                Pricing
              </Link>
            </li>
          </ul>
        </div>

        {/* Learn & Resources */}
        <div>
          <h4 className="font-medium text-neutral-900 dark:text-neutral-200 mb-3 text-xs tracking-wider uppercase">
            Resources
          </h4>
          <ul className="space-y-2">
            <li>
              <Link href="/prompt-engineering" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                Prompt Engineering Guide
              </Link>
            </li>
            <li>
              <Link href="/templates" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                Templates Library
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                Pricing & Plans
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="font-medium text-neutral-900 dark:text-neutral-200 mb-3 text-xs tracking-wider uppercase">
            Legal
          </h4>
          <ul className="space-y-2">
            <li>
              <Link href="/terms" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/refund-policy" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                Refund Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Trust info */}
        <div>
          <h4 className="font-medium text-neutral-900 dark:text-neutral-200 mb-3 text-xs tracking-wider uppercase">
            Positioning
          </h4>
          <p className="text-neutral-500 dark:text-neutral-500 text-xs leading-relaxed">
            PromptX writes prompts. It does not answer general knowledge questions or act as a chatbot.
          </p>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-neutral-100 dark:border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-neutral-500 text-[11px]">
        <span>© {new Date().getFullYear()} PromptX. All rights reserved.</span>
        <span>Built for ChatGPT, Claude, Gemini, Midjourney, and top AI models.</span>
      </div>
    </footer>
  );
}
