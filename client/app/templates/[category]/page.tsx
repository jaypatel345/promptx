import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORIES, getTemplatesByCategory, TemplateCategory } from "@/data/templates";
import CategoryLandingClient from "./CategoryLandingClient";

interface PageProps {
  params: Promise<{
    category: string;
  }>;
}

export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({
    category: c.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = CATEGORIES.find((c) => c.slug === categorySlug);

  if (!category) {
    return {
      title: "Category Not Found | PromptX",
    };
  }

  // Target keywords according to execution.md Part 6.1
  const title =
    category.slug === "image-generation"
      ? "AI Image Prompts: 20+ Prompts for Midjourney & DALL·E | PromptX"
      : `${category.name} Prompts & Templates | PromptX`;

  const description = `${category.description} Free tested prompt templates to copy directly into ChatGPT, Midjourney, Claude, and Gemini.`;

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: `https://promptx.co.in/templates/${category.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://promptx.co.in/templates/${category.slug}`,
      siteName: "PromptX",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category: categorySlug } = await params;
  const category = CATEGORIES.find((c) => c.slug === categorySlug);

  if (!category) {
    notFound();
  }

  const templates = getTemplatesByCategory(category.slug as TemplateCategory);

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name} Prompt Templates`,
    description: category.description,
    url: `https://promptx.co.in/templates/${category.slug}`,
    hasPart: templates.map((t) => ({
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
      {
        "@type": "ListItem",
        position: 3,
        name: category.name,
        item: `https://promptx.co.in/templates/${category.slug}`,
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
      <CategoryLandingClient category={category} templates={templates} />
    </>
  );
}
