function normalizeApiBase(raw: string) {
  const trimmed = raw.trim().replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

const rawBase =
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API ||
  process.env.API ||
  "";

function stripApiSuffix(value: string) {
  return value.trim().replace(/\/+$/, "").replace(/\/api$/, "");
}

function shouldUseProxyInProd() {
  const configuredOrigin = stripApiSuffix(rawBase);

  const frontendOrigin = process.env.NEXT_PUBLIC_BASE_URL
    ? stripApiSuffix(process.env.NEXT_PUBLIC_BASE_URL)
    : "";

  if (configuredOrigin && frontendOrigin && configuredOrigin === frontendOrigin)
    return true;

  if (typeof window !== "undefined") {
    const currentOrigin = stripApiSuffix(window.location.origin);
    if (configuredOrigin && configuredOrigin === currentOrigin) return true;
  }

  // If no explicit base is set, proxy mode is the safest production default.
  if (!configuredOrigin) return true;

  return false;
}

export const API_BASE =
  process.env.NODE_ENV === "production"
    ? shouldUseProxyInProd()
      ? "/api"
      : normalizeApiBase(rawBase)
    : normalizeApiBase(rawBase || "http://localhost:1571");
