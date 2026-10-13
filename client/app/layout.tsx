import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";
import { UiProvider } from "@/context/UiContext";
import { ThemeProvider } from "@/context/theme-context";
import LenisProvider from "@/components/LenisProvider";
import { ChatContextProvider } from "@/context/ChatContext";

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
    default: "PromptX — Free AI Prompt Generator for ChatGPT, Claude & Midjourney",
    template: "%s | PromptX",
  },

  // Keyword-targeted and high CTR description
  description:
    "Free AI prompt generator and prompt builder. Transform rough ideas into structured, high-performing prompts for ChatGPT, Claude, Gemini, Midjourney, and FLUX with zero login required.",

  // High-volume target keyword set from SERP intelligence
  keywords: [
    "AI prompt generator",
    "free AI prompt generator",
    "prompt builder for ChatGPT",
    "Midjourney prompt generator",
    "FLUX prompt generator",
    "AI image prompt generator",
    "prompt optimizer",
    "ChatGPT prompt templates",
    "prompt engineering guide",
    "AI prompt enhancer",
    "AI writing assistant",
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
        {/* Warm up the connection to Google's analytics origins ahead of
            the scripts below, so the actual requests don't pay full
            DNS/TLS handshake latency when they fire. */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />

        {/* Google Tag (gtag.js) — next/script defers this until after the
            page is interactive instead of blocking initial render. */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-HY2DRXLSF6"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-HY2DRXLSF6');
          `}
        </Script>
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
            <ChatContextProvider>
              <LenisProvider>{children}</LenisProvider>
            </ChatContextProvider>
          </UiProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
