import type { Metadata } from "next";
import { createCanonical, defaultOpenGraph } from "@/lib/seo";
import EnhancerClient from "./EnhancerClient";

const DESCRIPTION =
  "Turn rough ideas into polished prompts. PromptX rewrites and structures your input for ChatGPT, Claude, Gemini, or Grok, free to try with no signup required.";

export const metadata: Metadata = {
  // absolute bypasses the root layout's title template — plain strings were
  // getting "| PromptX" appended a second time (already ends with it).
  title: { absolute: "Prompt Enhancer – PromptX" },
  description: DESCRIPTION,
  alternates: {
    canonical: createCanonical("/enhancer"),
  },
  openGraph: defaultOpenGraph("/enhancer", "Prompt Enhancer – PromptX", DESCRIPTION),
};

export default function Page() {
  return <EnhancerClient />;
}