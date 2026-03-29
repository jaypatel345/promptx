import type { Metadata } from "next";
import { createCanonical, defaultOpenGraph } from "@/lib/seo";
import EnhancerClient from "./EnhancerClient";

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
  return <EnhancerClient />;
}