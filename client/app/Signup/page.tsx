import type { Metadata } from "next";
import Signup from "@/components/signup/signup";

export const metadata: Metadata = {
  title: "Create Account | PromptX",
  description:
    "Sign up for PromptX to start crafting production-grade AI prompts for ChatGPT, Claude, Midjourney, and FLUX.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function Page() {
  return <Signup />;
}
