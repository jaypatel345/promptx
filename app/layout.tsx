import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UiProvider } from "@/context/UiContext";
import { ThemeProvider } from "@/context/theme-context";
import LenisProvider from "@/component/LenisProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Helps Next generate absolute URLs for OG/Twitter, canonical, etc.
  metadataBase: new URL("https://promptx.co.in"),

  // Better title handling across pages (even if you later add nested page metadata)
  title: {
    default: "PromptX – AI Prompt Enhancer",
    template: "%s | PromptX",
  },

  // Keep it descriptive + keyword-aware (avoid stuffing)
  description:
    "PromptX is an AI prompt enhancer that helps you rewrite, optimize, and structure prompts for better results across ChatGPT and other AI tools.",

  // Light, relevant keyword set
  keywords: [
    "prompt enhancer",
    "AI prompt enhancer",
    "prompt optimizer",
    "prompt engineering",
    "ChatGPT prompts",
    "AI writing assistant",
    "prompt improvement tool",
  ],

  alternates: {
    canonical: "https://promptx.co.in/",
  },

  // Default indexing behavior
  robots: {
    index: true,
    follow: true,
    // Helpful defaults for Google snippets; adjust if needed
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Favicons / app icons
  icons: {
    icon: "/promptx-logo.png",
    shortcut: "/favicon.ico",
    apple: "/promptx-logo.png",
  },

  // Open Graph (social sharing)
  openGraph: {
    title: "PromptX – AI Prompt Enhancer",
    description:
      "Rewrite, optimize, and structure your prompts to get better outputs from ChatGPT and other AI tools.",
    url: "https://promptx.co.in/",
    siteName: "PromptX",
    images: [
      {
        url: "/promptx-logo.png",
        width: 1200,
        height: 630,
        alt: "PromptX – AI Prompt Enhancer",
      },
    ],
    type: "website",
    locale: "en_US",
  },

  // Twitter cards
  twitter: {
    card: "summary_large_image",
    title: "PromptX – AI Prompt Enhancer",
    description:
      "Rewrite, optimize, and structure your prompts to get better outputs from ChatGPT and other AI tools.",
    images: ["/promptx-logo.png"],
  },

  // Optional: helps with some SERP display context
  applicationName: "PromptX",
  category: "technology",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "PromptX",
              url: "https://promptx.co.in/",
              logo: "https://promptx.co.in/promptx-logo.png",
              image: "https://promptx.co.in/promptx-logo.png",
              description: "PromptX – AI Enhancer platform.",
              sameAs: [
                "https://www.linkedin.com/company/promptx-official",
                "https://github.com/jaypatel345/promptx",
              ],
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer support",
                email: "support@promptx.co.in",
                availableLanguage: ["English"],
              },
            }),
          }}
        />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-black bg-white dark:bg-black dark:text-white`}
      >
        <ThemeProvider>
          <UiProvider>
            <LenisProvider>{children}</LenisProvider>
          </UiProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
