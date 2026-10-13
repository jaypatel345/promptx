"use client";

import React from "react";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import Herosection from "@/components/home/herosection";
import HowItWorks from "@/components/home/HowItWorks";
import BeforeAfter from "@/components/home/BeforeAfter";
import TemplatesPreview from "@/components/home/TemplatesPreview";
import WorksWith from "@/components/home/WorksWith";
import UseCases from "@/components/home/UseCases";
import PricingTeaser from "@/components/home/PricingTeaser";
import Faq from "@/components/home/faq";
import FinalCta from "@/components/home/FinalCta";

export default function HomeClient() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 overflow-x-hidden selection:bg-neutral-200 dark:selection:bg-neutral-800">
      <Header />
      <main>
        {/* 1. Hero */}
        <Herosection />

        {/* 2. How it works in 3 steps */}
        <HowItWorks />

        {/* 3. Before / after example */}
        <BeforeAfter />

        {/* 4. Prompt templates preview */}
        <TemplatesPreview />

        {/* 5. Works with */}
        <WorksWith />

        {/* 6. Use cases */}
        <UseCases />

        {/* 7. Pricing teaser */}
        <PricingTeaser />

        {/* 8. FAQ */}
        <Faq />

        {/* 9. Final CTA */}
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
