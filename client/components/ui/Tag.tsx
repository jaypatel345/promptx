import React from "react";

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "subtle" | "accent";
  size?: "sm" | "md";
}

export function Tag({
  className = "",
  variant = "default",
  size = "sm",
  children,
  ...props
}: TagProps) {
  const variantStyles = {
    default:
      "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700",
    outline:
      "bg-transparent text-neutral-600 dark:text-neutral-400 border border-neutral-300 dark:border-neutral-700",
    subtle:
      "bg-neutral-100/60 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400 border border-transparent",
    accent:
      "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border border-transparent",
  };

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5 rounded-md font-medium tracking-wide",
    md: "text-xs px-2.5 py-1 rounded-md font-medium",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 leading-none select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
