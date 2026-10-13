import Link from "next/link";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";

export default function PricingCancelPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-neutral-100">
      <Header />
      <main className="max-w-2xl mx-auto px-4 pt-40 pb-24 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50 mb-3">
          Checkout was cancelled
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-8">
          No charges were made to your account. You can continue using PromptX Free with 10 daily enhanced prompts.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-lg font-medium text-xs bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 transition-colors"
          >
            Review Pricing Plans
          </Link>
          <Link
            href="/enhancer"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-lg font-medium text-xs border border-neutral-300 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
          >
            Continue with Free Tier
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
