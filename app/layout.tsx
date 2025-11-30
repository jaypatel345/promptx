import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UiProvider } from "@/context/UiContext";
import { ThemeProvider } from "@/context/theme-context";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-black bg-white dark:bg-black  dark:text-white `}
      >
        <ThemeProvider>
          <UiProvider>{children}</UiProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
