"use client";
import React, { useState } from "react";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // If content is empty
  if (!content) return null;

  // Split into blocks by code fences first
  const blocks: Array<{ type: "code" | "markdown"; lang?: string; text: string }> = [];
  const codeRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      blocks.push({
        type: "markdown",
        text: content.slice(lastIndex, match.index),
      });
    }
    blocks.push({
      type: "code",
      lang: match[1] || "text",
      text: match[2],
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    blocks.push({
      type: "markdown",
      text: content.slice(lastIndex),
    });
  }

  return (
    <div className="space-y-4 text-[13.5px] leading-relaxed text-neutral-800 dark:text-neutral-200">
      {blocks.map((block, idx) => {
        if (block.type === "code") {
          return <CodeBlock key={idx} lang={block.lang || "text"} code={block.text} />;
        }
        return <MarkdownBlock key={idx} text={block.text} />;
      })}
    </div>
  );
}

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-900 text-neutral-100 font-mono text-xs">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-neutral-950/80 border-b border-neutral-800 text-[11px] text-neutral-400">
        <span className="uppercase tracking-wider font-semibold">{lang}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
        >
          {copied ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Copied</span>
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto text-[12px] leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function MarkdownBlock({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <div className="space-y-2">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Empty line
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Horizontal rule
        if (trimmed === "---" || trimmed === "⸻" || trimmed === "***") {
          return <hr key={idx} className="my-3 border-neutral-200 dark:border-neutral-800" />;
        }

        // Header 1
        if (line.startsWith("# ")) {
          return (
            <h1 key={idx} className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight pt-1">
              {formatInline(line.slice(2))}
            </h1>
          );
        }

        // Header 2
        if (line.startsWith("## ")) {
          return (
            <h2 key={idx} className="text-sm sm:text-base font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight pt-2 border-b border-neutral-200/50 dark:border-neutral-800/50 pb-1">
              {formatInline(line.slice(3))}
            </h2>
          );
        }

        // Header 3
        if (line.startsWith("### ")) {
          return (
            <h3 key={idx} className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-200 pt-1 uppercase tracking-wider">
              {formatInline(line.slice(4))}
            </h3>
          );
        }

        // Bullet point
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-neutral-400 dark:text-neutral-600 select-none mt-1 text-[10px]">•</span>
              <span className="flex-1 leading-relaxed">{formatInline(line.slice(2))}</span>
            </div>
          );
        }

        // Numbered list
        const numMatch = line.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-neutral-500 font-mono text-xs select-none mt-0.5">{numMatch[1]}.</span>
              <span className="flex-1 leading-relaxed">{formatInline(numMatch[2])}</span>
            </div>
          );
        }

        // Standard line
        return (
          <p key={idx} className="leading-relaxed">
            {formatInline(line)}
          </p>
        );
      })}
    </div>
  );
}

function formatInline(text: string): React.ReactNode {
  // Parse inline bold, code, and links
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining) {
    // Check for inline code `...`
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      parts.push(
        <code
          key={keyIdx++}
          className="px-1.5 py-0.5 rounded bg-neutral-200/60 dark:bg-neutral-800 font-mono text-[12px] text-neutral-900 dark:text-neutral-100"
        >
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // Check for bold **...**
    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
    if (boldMatch) {
      parts.push(
        <strong key={keyIdx++} className="font-semibold text-neutral-900 dark:text-white">
          {boldMatch[1]}
        </strong>
      );
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Check for XML tag <tag>...</tag> or <tag>
    const xmlMatch = remaining.match(/^<([a-zA-Z0-9_-]+)>/);
    if (xmlMatch) {
      parts.push(
        <span key={keyIdx++} className="font-mono text-[12px] text-emerald-600 dark:text-emerald-400">
          &lt;{xmlMatch[1]}&gt;
        </span>
      );
      remaining = remaining.slice(xmlMatch[0].length);
      continue;
    }

    const xmlCloseMatch = remaining.match(/^<\/([a-zA-Z0-9_-]+)>/);
    if (xmlCloseMatch) {
      parts.push(
        <span key={keyIdx++} className="font-mono text-[12px] text-emerald-600 dark:text-emerald-400">
          &lt;/{xmlCloseMatch[1]}&gt;
        </span>
      );
      remaining = remaining.slice(xmlCloseMatch[0].length);
      continue;
    }

    // Regular char up to next special char
    const nextSpecial = remaining.search(/[`*<]/);
    if (nextSpecial === -1) {
      parts.push(remaining);
      break;
    } else if (nextSpecial === 0) {
      // Just single char that didn't match a full token
      parts.push(remaining[0]);
      remaining = remaining.slice(1);
    } else {
      parts.push(remaining.slice(0, nextSpecial));
      remaining = remaining.slice(nextSpecial);
    }
  }

  return <>{parts}</>;
}
