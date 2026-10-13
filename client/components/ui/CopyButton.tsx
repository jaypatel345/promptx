"use client";

import React, { useState } from "react";

export interface CopyButtonProps {
  text: string;
  className?: string;
  label?: string;
  copiedLabel?: string;
  size?: "sm" | "md";
}

export function CopyButton({
  text,
  className = "",
  label = "Copy prompt",
  copiedLabel = "Copied!",
  size = "sm",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const sizeClasses =
    size === "sm"
      ? "text-xs px-2.5 py-1.5 rounded-md gap-1.5"
      : "text-sm px-3.5 py-2 rounded-lg gap-2";

  return (
    <button
      onClick={handleCopy}
      type="button"
      aria-label="Copy to clipboard"
      className={`inline-flex items-center font-medium border transition-colors cursor-pointer select-none ${
        copied
          ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 border-transparent"
          : "bg-white text-neutral-800 hover:bg-neutral-50 border-neutral-300 dark:bg-neutral-900 dark:text-neutral-200 dark:border-neutral-700 dark:hover:bg-neutral-800"
      } ${sizeClasses} ${className}`}
    >
      {copied ? (
        <svg
          className="w-3.5 h-3.5 text-current shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg
          className="w-3.5 h-3.5 text-current shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
      <span>{copied ? copiedLabel : label}</span>
    </button>
  );
}
