import type { Metadata } from "next";
import TemplatesListClient from "./TemplatesListClient";
import { TEMPLATES } from "@/data/templates";

const TITLE = "AI Prompt Templates: 35+ Tested Prompts for ChatGPT, Midjourney & FLUX | PromptX";
const DESCRIPTION =
  "Browse tested AI prompt templates for ChatGPT, Claude, Midjourney, FLUX, and video AI tools. Copy verified prompts for images, coding, viral reel hooks, and career with zero signup.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: {
    canonical: "https://promptx.co.in/templates",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://promptx.co.in/templates",
    siteName: "PromptX",
    images: [
      {
        url: "/promptx-logo.png",
        width: 1200,
        height: 630,
        alt: "PromptX AI Prompt Templates Library",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/promptx-logo.png"],
  },
};

export default function TemplatesPage() {
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "PromptX AI Prompt Templates",
    description: DESCRIPTION,
    url: "https://promptx.co.in/templates",
    hasPart: TEMPLATES.slice(0, 15).map((t) => ({
      "@type": "CreativeWork",
      name: t.title,
      description: t.description,
      url: `https://promptx.co.in/templates/${t.category}/${t.slug}`,
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
        name: "Templates",
        item: "https://promptx.co.in/templates",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <TemplatesListClient />
    </>
  );
}
