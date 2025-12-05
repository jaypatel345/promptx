"use client";

import Enhancer from "@/component/enhancer/enhancer";
import React from "react";
import type { Metadata } from "next";
import { createCanonical, defaultOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Prompt Enhancer – PromptX",
  description: "Enhance prompts using AI-driven optimization.",
  alternates: {
    canonical: createCanonical("/Enhancer"),
  },
  openGraph: defaultOpenGraph(
    "/Enhancer",
    "Prompt Enhancer – PromptX",
    "Enhance prompts using AI-driven optimization."
  ),
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Prompt Enhancer",
    description: "Enhance prompts using AI-driven optimization.",
    url: "https://promptx.co.in/Enhancer",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Enhancer />
    </>
  );
}