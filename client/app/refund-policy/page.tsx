import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";

export const metadata: Metadata = {
  title: { absolute: "Refund Policy | PromptX" },
  description: "PromptX refund and cancellation terms: 7-day money-back guarantee on Pro plans.",
  alternates: {
    canonical: "https://promptx.co.in/refund-policy",
  },
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 selection:bg-neutral-200 dark:selection:bg-neutral-800">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        <div className="mb-10">
          <div className="text-xs font-mono text-neutral-500 mb-2">Legal · Last Updated March 2026</div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
            Refund & Cancellation Policy
          </h1>
          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
            We want you to be completely satisfied with your PromptX experience.
          </p>
        </div>

        <div className="space-y-10 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed border-t border-neutral-200 dark:border-neutral-800 pt-8">
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              1. 7-Day Money-Back Guarantee
            </h2>
            <p>
              We offer a straightforward, no-questions-asked 7-day money-back guarantee for initial upgrades to PromptX Pro (monthly or yearly). If you determine that PromptX does not meet your workflow requirements, you can request a full refund within 7 calendar days from your initial transaction date.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              2. How to Request a Refund
            </h2>
            <p>
              To claim a refund, email our support team at{" "}
              <a href="mailto:support@promptx.co.in" className="text-neutral-900 dark:text-white underline">
                support@promptx.co.in
              </a>{" "}
              with the subject line: <code>[Refund Request] - &lt;Your Account Email&gt;</code>.
            </p>
            <p>
              Include your order ID or payment invoice number. Our billing department will verify the charge and initiate the refund within 24 to 48 hours.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              3. Processing Timeline & Payment Providers
            </h2>
            <p>
              Once initiated, refunds are returned to your original payment method:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-neutral-600 dark:text-neutral-400">
              <li><strong>UPI (Google Pay, PhonePe, Paytm):</strong> Typically processed within 1 to 3 banking days.</li>
              <li><strong>Credit / Debit Cards:</strong> Typically posted within 5 to 7 business days, subject to your card issuer&apos;s processing schedule.</li>
              <li><strong>International Cards / Stripe:</strong> 5 to 10 business days depending on currency exchange clearing.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              4. Subscription Cancellations
            </h2>
            <p>
              You can cancel recurring billing at any point prior to your next renewal date directly through your user dashboard or by contacting support. Following cancellation, your Pro benefits will remain active until the conclusion of your current paid billing period, and no subsequent charges will be made.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              5. Questions
            </h2>
            <p>
              Have a question regarding billing? Review our{" "}
              <Link href="/pricing" className="text-neutral-900 dark:text-white underline underline-offset-4">
                Pricing FAQs
              </Link>{" "}
              or email{" "}
              <a href="mailto:support@promptx.co.in" className="text-neutral-900 dark:text-white underline">
                support@promptx.co.in
              </a>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
