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
  title: "PromptX – AI Enhancer",
  description: "Your AI-powered enhancement platform.",
  alternates: {
    canonical: "https://promptx.co.in/",
  },
  icons: {
    icon: "/promptx-logo.png",
    shortcut: "/favicon.ico",
    apple: "/promptx-logo.png",
  },
  openGraph: {
    title: "PromptX – AI Enhancer",
    description: "Your AI-powered enhancement platform.",
    url: "https://promptx.co.in/",
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
  },
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
