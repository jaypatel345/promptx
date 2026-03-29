import type { SiteDoc } from "./site-knowledge";

function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(s: string) {
  const parts = normalize(s).split(" ").filter(Boolean);
  // remove super-common junk words (simple stoplist)
  const stop = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "to",
    "of",
    "in",
    "on",
    "for",
    "with",
    "is",
    "are",
    "was",
    "were",
    "be",
    "about",
    "me",
    "i",
    "you",
    "we",
    "our",
  ]);
  return parts.filter((p) => !stop.has(p));
}

export function rankDocs(query: string, docs: SiteDoc[], limit = 5) {
  const qTokens = tokenize(query);
  if (qTokens.length === 0) {
    return docs.slice(0, limit).map((doc) => ({ doc, score: 0 }));
  }

  return docs
    .map((doc) => {
      const hay = normalize(
        `${doc.title} ${doc.tags?.join(" ") ?? ""} ${doc.content}`
      );
      let score = 0;

      for (const t of qTokens) {
        if (hay.includes(t)) score += 1;
      }

      // bonus if query directly matches title words
      const titleHay = normalize(doc.title);
      for (const t of qTokens) {
        if (titleHay.includes(t)) score += 2;
      }

      return { doc, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
