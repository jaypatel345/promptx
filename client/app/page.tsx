import type { Metadata } from "next";
import { FAQ_ITEMS } from "@/data/faq";
import HomeClient from "@/components/home/HomeClient";

const TITLE = "PromptX AI (Prompt X) — Free AI Prompt Generator & Prompt Builder";
const DESCRIPTION =
  "PromptX AI (Prompt X) turns rough ideas into high-performing prompts in seconds. Free AI prompt builder and tested templates for ChatGPT, Claude, Gemini, Midjourney, and FLUX with no login required.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: {
    canonical: "https://promptx.co.in/",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://promptx.co.in/",
    siteName: "PromptX AI",
    images: [
      {
        url: "/promptx-logo.png",
        width: 1200,
        height: 630,
        alt: "PromptX AI Free Prompt Generator and Prompt Templates",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/promptx-logo.png"],
  },
};

export default function Page() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "PromptX AI",
    alternateName: ["PromptX", "Prompt X", "Prompt X AI", "PromptX.co.in"],
    operatingSystem: "WebBrowser, All",
    applicationCategory: "DesignApplication",
    applicationSubCategory: "AI Prompt Generator & Prompt Engineering Tool",
    description: DESCRIPTION,
    url: "https://promptx.co.in/",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "184",
      bestRating: "5",
      worstRating: "1",
    },
    featureList: [
      "Multi-Model Prompt Generator (ChatGPT, Claude, Gemini, Midjourney, FLUX)",
      "Zero-Login Instant Generation",
      "CRISP & CREATE Prompt Structuring Frameworks",
      "Interactive Variable Customizer",
      "One-Click Clipboard Copy",
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "PromptX",
    url: "https://promptx.co.in/",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://promptx.co.in/templates?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
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
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <HomeClient />
    </>
  );
}
