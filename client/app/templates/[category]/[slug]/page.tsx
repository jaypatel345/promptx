import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TEMPLATES, getTemplateBySlug, getRelatedTemplates } from "@/data/templates";
import TemplateDetailClient from "./TemplateDetailClient";

interface PageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return TEMPLATES.map((t) => ({
    category: t.category,
    slug: t.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const template = getTemplateBySlug(slug);

  if (!template) {
    return {
      title: "Template Not Found | PromptX",
    };
  }

  const title = `${template.title} Prompt Template | PromptX`;
  const description = `${template.description} Complete copy-ready prompt for ${template.tool.join(", ")}.`;

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: `https://promptx.co.in/templates/${template.category}/${template.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://promptx.co.in/templates/${template.category}/${template.slug}`,
      siteName: "PromptX",
      images: [
        {
          url: template.coverImage,
          width: 1200,
          height: 900,
          alt: template.coverAlt,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [template.coverImage],
    },
  };
}

export default async function TemplateDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const template = getTemplateBySlug(slug);

  if (!template) {
    notFound();
  }

  const related = getRelatedTemplates(template.slug, 4);

  const imageSchema = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    contentUrl: `https://promptx.co.in${template.coverImage}`,
    name: template.title,
    description: template.coverAlt,
  };

  const creativeWorkSchema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: template.title,
    description: template.description,
    text: template.prompt,
    keywords: template.tool.join(", "),
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
        name: template.category,
        item: `https://promptx.co.in/templates/${template.category}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: template.title,
        item: `https://promptx.co.in/templates/${template.category}/${template.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(imageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(creativeWorkSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <TemplateDetailClient template={template} relatedTemplates={related} />
    </>
  );
}
