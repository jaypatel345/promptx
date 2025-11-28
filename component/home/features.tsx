// components/Features.tsx
"use client";
import { useUi } from "@/context/UiContext";
import React from "react";

export default function Features() {
  const { isNavOpen, setIsNavOpen } = useUi();
  return (
    <section
      className={`relative w-full lg:max-w-6xl mx-auto mt-40 px-4 sm:px-6 lg:px-0 transition-all duration-300 dark:bg-black dark:text-white  ${
        isNavOpen ? "translate-x-70 md:translate-x-12" : "translate-x-0"
      }`}
    >
      {/* Top Stats */}
      <div className="absolute top-0 left-0 w-full h-[1.5px] bg-linear-to-r from-transparent via-gray-300 to-transparent"></div>

      <div className="pt-40 grid grid-cols-1 sm:grid-cols-3 text-center gap-8 sm:gap-2">
        <div>
          <h2 className="text-4xl sm:text-5xl font-normal">4.3x</h2>
          <p className="text-gray-500 text-sm mt-1">Faster prompt execution</p>
        </div>

        <div className="sm:border-l sm:border-r border-gray-200 sm:px-8">
          <h2 className="text-4xl sm:text-5xl font-normal">92%</h2>
          <p className="text-gray-500 text-sm mt-1">Higher output accuracy</p>
        </div>

        <div className="sm:px-8">
          <h2 className="text-4xl sm:text-5xl font-normal">3.8x</h2>
          <p className="text-gray-500 text-sm mt-1">
            Improved workflow efficiency
          </p>
        </div>
      </div>

      {/* Section Title */}
      <div className="mt-20 sm:mt-30 flex flex-col items-center">
        <h1 className="text-3xl sm:text-5xl font-normal leading-snug text-center px-4">
          Sharper prompts. Faster results.
        </h1>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-29 mt-20 sm:mt-30 text-center ">
        {/* Feature 1 */}
        <div className="text-left dark:text-white">
          <div className="text-2xl inline-block dark:text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 256"
              width={25}
              className="text-black dark:text-white"
              fill="currentColor"
            >
              <path d="M240,56v64a8,8,0,0,1-16,0V75.31l-82.34,82.35a8,8,0,0,1-11.32,0L96,123.31,29.66,189.66a8,8,0,0,1-11.32-11.32l72-72a8,8,0,0,1,11.32,0L136,140.69,212.69,64H168a8,8,0,0,1,0-16h64A8,8,0,0,1,240,56Z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mt-4">
            Instant Prompt Enhancement
          </h3>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">
            PromptX analyzes intent and optimizes every prompt for the best
            possible response — delivering refined, powerful, and structured
            output in seconds.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="text-left">
          <div className="text-2xl inline-block">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 256"
              focusable="false"
              className="text-black dark:text-white"
              fill="currentColor"
              width={25}
            >
              <path d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96ZM208,208H48V96H208V208Zm-68-56a12,12,0,1,1-12-12A12,12,0,0,1,140,152Z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium mt-4">
            Reliable & Consistent Output
          </h3>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">
            Our enhancement engine produces stable, dependable results across
            complex tasks — ensuring clarity, context, and precision every time.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="text-left">
          <div className="text-2xl inline-block">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 256"
              focusable="false"
              className="text-black dark:text-white"
              fill="currentColor"
              width={25}
            >
              <path d="M176,128a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h80A8,8,0,0,1,176,128Zm56,0A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium mt-4">Boost Productivity</h3>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">
            Reduce rewriting, avoid trial & error, and accelerate your workflow.
            PromptX helps users focus on execution instead of fixing prompts.
          </p>
        </div>
      </div>
    </section>
  );
}
