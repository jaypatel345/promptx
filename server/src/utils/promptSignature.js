import crypto from "node:crypto";

export function getPromptSignature(prompt) {
  const text = String(prompt || "");

  return {
    sha256: crypto.createHash("sha256").update(text).digest("hex"),
    preview: text.slice(0, 100),
  };
}
