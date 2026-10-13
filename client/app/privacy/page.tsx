import type { Metadata } from "next";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";

export const metadata: Metadata = {
  title: { absolute: "Privacy Policy | PromptX" },
  description: "PromptX privacy policy: how we safeguard user data, prompts, and personal information.",
  alternates: {
    canonical: "https://promptx.co.in/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 selection:bg-neutral-200 dark:selection:bg-neutral-800">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        <div className="mb-10">
          <div className="text-xs font-mono text-neutral-500 mb-2">Legal · Last Updated March 2026</div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
            We believe your creative ideas and engineering prompts belong exclusively to you.
          </p>
        </div>

        <div className="space-y-10 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed border-t border-neutral-200 dark:border-neutral-800 pt-8">
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">1. Information We Collect</h2>
            <p>
              Depending on how you interact with PromptX, we may collect the following information:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-neutral-600 dark:text-neutral-400">
              <li><strong>Guest Usage:</strong> Temporary session IDs and locally stored prompts kept directly in your browser. We do not require registration for guest use.</li>
              <li><strong>Registered Users:</strong> Email address, hashed password, and optionally Google account profile when using Google OAuth.</li>
              <li><strong>Transaction Data:</strong> Billing contact details, payment confirmation records, and subscription tier IDs handled via Razorpay or Stripe. We never store credit card numbers on our servers.</li>
              <li><strong>Telemetry:</strong> Pseudonymized usage metrics such as pages viewed, button clicks, and error reports to maintain performance and uptime.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">2. How We Use and Protect Your Prompts</h2>
            <p>
              <strong>We do not sell your personal data or your prompts.</strong> Furthermore, we do not utilize your private inputs or prompt enhancement requests to train publicly accessible machine learning models.
            </p>
            <p>
              Your prompts are processed securely to execute the requested restructuring and returned directly to your browser. If you have an active account, your history is stored in an encrypted database accessible only with your authentication token.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">3. Cookies and Local Storage</h2>
            <p>
              We utilize cookies and browser local storage strictly for essential operations, including theme preference (dark/light mode), authentication state maintenance, and guest session preservation. You can control cookie preferences in your browser settings at any time.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">4. Your Data Rights (GDPR & CCPA)</h2>
            <p>
              You have the right to inspect, export, or permanently delete all personal data and prompt history associated with your account. To request permanent account deletion, submit an email request to our privacy team.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">5. Contact Our Privacy Officer</h2>
            <p>
              For privacy-related questions or data deletion requests, contact us at:{" "}
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
