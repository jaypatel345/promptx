// lib/seo.ts
export function createCanonical(path: string) {
  const base = "https://promptx.co.in";
  return `${base}${path}`;
}

export function defaultOpenGraph(path: string, title: string, description: string) {
  return {
    title,
    description,
    url: createCanonical(path),
    siteName: "PromptX",
    images: [
      {
        url: "https://promptx.co.in/promptx-logo.png",
        width: 1200,
        height: 630,
        alt: "PromptX Logo",
      },
    ],
    type: "website",
    locale: "en_US",
  };
}