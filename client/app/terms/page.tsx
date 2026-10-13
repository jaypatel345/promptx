import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";

export const metadata: Metadata = {
  title: { absolute: "Terms of Service | PromptX" },
  description: "Terms and conditions governing the use of the PromptX prompt engineering platform.",
  alternates: {
    canonical: "https://promptx.co.in/terms",
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 selection:bg-neutral-200 dark:selection:bg-neutral-800">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        <div className="mb-10">
          <div className="text-xs font-mono text-neutral-500 mb-2">Legal · Last Updated March 2026</div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
            Please read these terms carefully before using the PromptX platform and services.
          </p>
        </div>

        <div className="space-y-10 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed border-t border-neutral-200 dark:border-neutral-800 pt-8">
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">1. Nature of the Service</h2>
            <p>
              PromptX provides prompt optimization, prompt engineering, and prompt template tools for third-party artificial intelligence engines (including ChatGPT, Claude, Gemini, Midjourney, and others). PromptX is not a general conversational agent, information lookup service, or chatbot. You agree to utilize PromptX solely for formulating, structuring, and refining prompts.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">2. User Accounts and Guest Access</h2>
            <p>
              You may access basic features of PromptX as a guest or create an authenticated account. You are responsible for safeguarding your login credentials and are solely responsible for any activity conducted through your account. PromptX reserves the right to terminate accounts that violate our acceptable use guidelines.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">3. Acceptable Use and Safety</h2>
            <p>
              You agree not to use PromptX to generate prompts designed to create:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-neutral-600 dark:text-neutral-400">
              <li>Sexually explicit, non-consensual sexual content, or child sexual exploitation material.</li>
              <li>Hate speech, harassment, incitement of violence, or defamation.</li>
              <li>Malicious cyber operations, vulnerability exploits, or malware development.</li>
              <li>Unlawful acts or fraud.</li>
            </ul>
            <p>
              We employ automated filtering and content moderation. Violations may result in immediate suspension without refund.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">4. Intellectual Property & Prompt Ownership</h2>
            <p>
              <strong>Your Prompts:</strong> You retain full ownership of all prompts, text, and inputs you submit to PromptX, as well as the enhanced outputs generated for you. You may use, edit, publish, and commercially exploit your generated prompts freely.
            </p>
            <p>
              <strong>PromptX IP:</strong> PromptX and its licensors retain all proprietary rights, trademarks, branding, user interface code, and underlying algorithms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">5. Subscriptions, Payments & Billing</h2>
            <p>
              Pro subscriptions are billed on a recurring monthly or annual basis depending on your selected plan. Payments are processed securely via authorized third-party gateways (Razorpay and Stripe). All fees are quoted in USD or INR as selected. You may cancel your subscription at any time via your account settings; cancellation takes effect at the end of the current billing cycle.
            </p>
            <p>
              For details on refunds, please review our{" "}
              <Link href="/refund-policy" className="text-neutral-900 dark:text-white underline underline-offset-4">
                Refund Policy
              </Link>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">6. Disclaimers & Limitation of Liability</h2>
            <p>
              PromptX provides prompts on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. Artificial intelligence models operate probabilistically; PromptX cannot guarantee that external models will execute generated prompts without errors or hallucinations. Under no circumstances shall PromptX be liable for direct, indirect, incidental, or consequential damages resulting from your use of AI models.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">7. Contact Information</h2>
            <p>
              For inquiries regarding these Terms of Service, contact us at:{" "}
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
