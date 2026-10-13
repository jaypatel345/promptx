import type { Metadata } from "next";
import PromptEngineeringClient from "./PromptEngineeringClient";
import { PE_FAQS } from "@/data/faq";

const TITLE = "Prompt Engineering: A Practical Guide to Writing Better Prompts | PromptX";
const DESCRIPTION =
  "Learn how to write better AI prompts for ChatGPT, Claude, Gemini, and Midjourney. A practical, fluff-free guide covering roles, constraints, CoT, and few-shot prompting.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: {
    canonical: "https://promptx.co.in/prompt-engineering",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://promptx.co.in/prompt-engineering",
    siteName: "PromptX",
    type: "article",
    images: [
      {
        url: "/promptx-logo.png",
        width: 1200,
        height: 630,
        alt: "Prompt Engineering Guide by PromptX",
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

export default function PromptEngineeringPage() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Prompt Engineering: A Practical Guide to Writing Better Prompts",
    description: DESCRIPTION,
    image: "https://promptx.co.in/promptx-logo.png",
    author: {
      "@type": "Organization",
      name: "PromptX",
      url: "https://promptx.co.in",
    },
    publisher: {
      "@type": "Organization",
      name: "PromptX",
      logo: {
        "@type": "ImageObject",
        url: "https://promptx.co.in/promptx-logo.png",
      },
    },
    datePublished: "2026-03-01T00:00:00Z",
    dateModified: "2026-03-29T00:00:00Z",
    mainEntityOfPage: "https://promptx.co.in/prompt-engineering",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: PE_FAQS.map((f) => ({
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
        name: "Prompt Engineering",
        item: "https://promptx.co.in/prompt-engineering",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <PromptEngineeringClient />
    </>
  );
}
