import type { Metadata } from "next";
import { Suspense } from "react";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Sign In | PromptX",
  description: "Sign in to PromptX to access your prompt engineering suite and templates.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-white dark:bg-black text-neutral-400">
          <div className="w-5 h-5 border-2 border-neutral-300 dark:border-neutral-700 border-t-neutral-900 dark:border-t-neutral-100 rounded-full animate-spin" />
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
