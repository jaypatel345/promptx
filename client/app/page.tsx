import type { Metadata } from "next";
import { createCanonical, defaultOpenGraph } from "@/lib/seo";
import HomeClient from "./HomeClient";

const TITLE = "AI Prompt Enhancer for ChatGPT, Claude & Gemini | PromptX";
const DESCRIPTION =
  "PromptX is an AI prompt enhancer that helps you rewrite, optimize, and structure prompts for better results across ChatGPT and other AI tools.";

export const metadata: Metadata = {
  // absolute bypasses the root layout's title template so this exact string
  // renders as-is (it already includes the "| PromptX" brand suffix).
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: {
    canonical: createCanonical("/"),
  },
  openGraph: defaultOpenGraph("/", TITLE, DESCRIPTION),
};

export default function Page() {
  return <HomeClient />;
}
