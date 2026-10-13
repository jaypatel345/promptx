import Link from "next/link";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";

export default function PricingSuccessPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-neutral-100">
      <Header />
      <main className="max-w-2xl mx-auto px-4 pt-40 pb-24 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-6">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50 mb-3">
          Welcome to PromptX Pro!
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-8">
          Your account has been upgraded with unlimited prompt enhancements, access to all template parameters, and saved history.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/enhancer"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-lg font-medium text-xs bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 transition-colors"
          >
            <span>Start Building Prompts</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
          <Link
            href="/templates"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-lg font-medium text-xs border border-neutral-300 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
          >
            Explore Templates
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
