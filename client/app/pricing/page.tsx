import type { Metadata } from "next";
import PricingClient from "./PricingClient";
import { PRICING_FAQS } from "@/data/faq";

const TITLE = "PromptX Pricing: Free and Pro Prompt Generator Plans";
const DESCRIPTION =
  "Compare PromptX plans. Start free and upgrade for unlimited prompts, all templates, and saved history. Pay with UPI, cards, or PayPal.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: {
    canonical: "https://promptx.co.in/pricing",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://promptx.co.in/pricing",
    siteName: "PromptX",
    type: "website",
    images: [
      {
        url: "/promptx-logo.png",
        width: 1200,
        height: 630,
        alt: "PromptX Pricing Plans",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/promptx-logo.png"],
  },
};

export default function PricingPage() {
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "PromptX Pro",
    description: "AI prompt engineering and template suite with unlimited prompt generations.",
    offers: [
      {
        "@type": "Offer",
        name: "PromptX Free",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
      {
        "@type": "Offer",
        name: "PromptX Pro Monthly",
        price: "12",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
      {
        "@type": "Offer",
        name: "PromptX Pro Yearly",
        price: "99",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: PRICING_FAQS.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://promptx.co.in",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Pricing",
        item: "https://promptx.co.in/pricing",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <PricingClient />
    </>
  );
}
