function normalizeApiBase(raw: string) {
  const trimmed = raw.trim().replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

const rawBase =
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API ||
  process.env.API ||
  "http://localhost:1571/api";

export const API_BASE = normalizeApiBase(rawBase);
