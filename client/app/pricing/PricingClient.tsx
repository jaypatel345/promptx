"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import { useUi } from "@/context/UiContext";
import { PRICING_FAQS } from "@/data/faq";

export default function PricingClient() {
  const { isNavOpen, setIsLoginOpen } = useUi();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const [currency, setCurrency] = useState<"USD" | "INR">("USD");
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const prices = {
    USD: {
      free: "$0",
      proMonthly: "$12",
      proYearly: "$99",
      yearlyMonthlyEquivalent: "$8.25",
    },
    INR: {
      free: "₹0",
      proMonthly: "₹999",
      proYearly: "₹7,999",
      yearlyMonthlyEquivalent: "₹666",
    },
  };

  const handleCheckout = async (plan: "pro_monthly" | "pro_yearly") => {
    try {
      setCheckoutLoading(plan);
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          currency,
          billingCycle,
        }),
      });

      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else if (data?.requiresAuth) {
        setIsLoginOpen(true);
      } else {
        // Fallback to direct checkout link or alert
        window.location.href = `/api/checkout?plan=${plan}&currency=${currency}`;
      }
    } catch (e) {
      console.error(e);
      window.location.href = `/enhancer`;
    } finally {
      setCheckoutLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 selection:bg-neutral-200 dark:selection:bg-neutral-800">
      <Header />
      <main
        className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 transition-all duration-300 ${
          isNavOpen ? "translate-x-70 md:translate-x-12" : "translate-x-0"
        }`}
      >
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 text-xs text-neutral-600 dark:text-neutral-400 mb-4 select-none font-mono">
            <span>Simple & Transparent</span>
            <span>·</span>
            <span>No hidden fees</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50 leading-[1.15]">
            Simple plans for serious prompt engineering
          </h1>

          <p className="mt-4 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xl mx-auto">
            Start completely free with 10 prompts daily. Upgrade to Pro for unlimited generation, private prompt history, and custom model configurations.
          </p>

          {/* Controls: Billing Cycle and Currency Toggle */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {/* Monthly / Yearly Toggle */}
            <div className="inline-flex items-center p-1 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  billingCycle === "monthly"
                    ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs border border-neutral-200 dark:border-neutral-700"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
                }`}
              >
                Monthly billing
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  billingCycle === "yearly"
                    ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs border border-neutral-200 dark:border-neutral-700"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
                }`}
              >
                <span>Yearly billing</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 font-semibold">
                  Save 30%
                </span>
              </button>
            </div>

            {/* Currency switch */}
            <div className="inline-flex items-center p-1 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs">
              <button
                onClick={() => setCurrency("USD")}
                className={`px-2.5 py-1 rounded-md font-mono font-medium transition-colors cursor-pointer ${
                  currency === "USD"
                    ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                USD ($)
              </button>
              <button
                onClick={() => setCurrency("INR")}
                className={`px-2.5 py-1 rounded-md font-mono font-medium transition-colors cursor-pointer ${
                  currency === "INR"
                    ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                INR (₹)
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {/* 1. Free Plan */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg text-neutral-900 dark:text-neutral-100">Free</h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800">
                  Guest Friendly
                </span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed mb-6">
                Perfect for quick prompt improvements and exploring our public templates.
              </p>
              <div className="mb-6">
                <span className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white font-mono">
                  {prices[currency].free}
                </span>
                <span className="text-xs text-neutral-500 ml-1">/ forever</span>
              </div>

              <ul className="space-y-3 text-xs text-neutral-600 dark:text-neutral-400 border-t border-neutral-100 dark:border-neutral-900 pt-6">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>10 enhanced prompts per day</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Access to public prompt templates</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>One-click copy to clipboard</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Standard model format tuning</span>
                </li>
                <li className="flex items-center gap-2 text-neutral-400">
                  <span>–</span>
                  <span>Unlimited prompt generations</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-900">
              <Link
                href="/enhancer"
                className="w-full inline-flex items-center justify-center h-10 px-4 rounded-lg font-medium text-xs border border-neutral-300 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
              >
                Start free now
              </Link>
            </div>
          </div>

          {/* 2. Pro Plan (Highlighted, Most Popular) */}
          <div className="relative rounded-2xl border-2 border-neutral-900 dark:border-neutral-100 bg-white dark:bg-neutral-950 p-7 flex flex-col justify-between">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-[11px] font-medium tracking-wide uppercase font-mono">
              Most Popular
            </div>

            <div>
              <div className="flex items-center justify-between mb-4 mt-1">
                <h3 className="font-semibold text-lg text-neutral-900 dark:text-neutral-100">Pro</h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
                  Full Access
                </span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed mb-6">
                For developers, creators, and operators who use LLMs and image tools daily.
              </p>
              <div className="mb-6">
                <span className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white font-mono">
                  {billingCycle === "yearly"
                    ? prices[currency].yearlyMonthlyEquivalent
                    : prices[currency].proMonthly}
                </span>
                <span className="text-xs text-neutral-500 ml-1">/ month</span>
                {billingCycle === "yearly" && (
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Billed annually as {prices[currency].proYearly} (2 months free)
                  </p>
                )}
              </div>

              <ul className="space-y-3 text-xs text-neutral-700 dark:text-neutral-300 border-t border-neutral-100 dark:border-neutral-900 pt-6">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span className="font-medium">Unlimited enhanced prompts</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>All 25+ templates with variable customizer</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Permanent saved prompt history</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Midjourney, DALL·E 3 & Video parameters</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Priority fast-lane processing</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-900">
              <button
                onClick={() =>
                  handleCheckout(billingCycle === "yearly" ? "pro_yearly" : "pro_monthly")
                }
                disabled={checkoutLoading !== null}
                className="w-full inline-flex items-center justify-center h-10 px-4 rounded-lg font-medium text-xs bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                {checkoutLoading ? "Redirecting..." : "Upgrade to Pro"}
              </button>
            </div>
          </div>

          {/* 3. Team Plan */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg text-neutral-900 dark:text-neutral-100">Team</h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800">
                  5+ Members
                </span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed mb-6">
                Centralized prompt governance and private company templates.
              </p>
              <div className="mb-6">
                <span className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white font-mono">
                  Custom
                </span>
                <span className="text-xs text-neutral-500 ml-1">/ volume pricing</span>
              </div>

              <ul className="space-y-3 text-xs text-neutral-600 dark:text-neutral-400 border-t border-neutral-100 dark:border-neutral-900 pt-6">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Everything in Pro for all team members</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Shared company prompt repository</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Custom brand voice and system presets</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Centralized invoice & GST billing</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Dedicated support manager</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-900">
              <Link
                href="/Teams"
                className="w-full inline-flex items-center justify-center h-10 px-4 rounded-lg font-medium text-xs border border-neutral-300 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
              >
                Contact for Teams
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="mb-20">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6 text-center">
            Feature Comparison
          </h2>
          <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
            <table className="w-full text-left text-xs text-neutral-600 dark:text-neutral-400">
              <thead className="bg-neutral-50 dark:bg-neutral-900/60 text-neutral-900 dark:text-white font-mono uppercase tracking-wider text-[11px] border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="p-4">Feature</th>
                  <th className="p-4">Free</th>
                  <th className="p-4 text-neutral-900 dark:text-white font-semibold">Pro</th>
                  <th className="p-4">Team</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                <tr>
                  <td className="p-4 font-medium text-neutral-900 dark:text-neutral-200">Daily Enhanced Prompts</td>
                  <td className="p-4">10 / day</td>
                  <td className="p-4 text-emerald-600 dark:text-emerald-400 font-medium">Unlimited</td>
                  <td className="p-4">Unlimited</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-neutral-900 dark:text-neutral-200">Prompt Template Library</td>
                  <td className="p-4">Public collection</td>
                  <td className="p-4">All templates + Variables</td>
                  <td className="p-4">Public + Company Private</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-neutral-900 dark:text-neutral-200">Saved Prompt History</td>
                  <td className="p-4">Local session</td>
                  <td className="p-4">Cloud sync forever</td>
                  <td className="p-4">Cloud sync + Shared workspace</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-neutral-900 dark:text-neutral-200">Image & Video Mode</td>
                  <td className="p-4">Basic</td>
                  <td className="p-4">Advanced parameters</td>
                  <td className="p-4">Advanced parameters</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-neutral-900 dark:text-neutral-200">Payment Options</td>
                  <td className="p-4">Free</td>
                  <td className="p-4">UPI, Cards, PayPal</td>
                  <td className="p-4">Wire, Corporate Card, GST Invoice</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Pricing FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold text-center text-neutral-900 dark:text-neutral-100 mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {PRICING_FAQS.map((faq) => (
              <div
                key={faq.question}
                className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950"
              >
                <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 mb-2">
                  {faq.question}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
