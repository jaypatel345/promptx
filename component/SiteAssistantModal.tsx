"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Source = { title: string; url: string };

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  followups?: string[];
};

const EXAMPLE_QUERIES = [
  "Who is building PromptX?",
  "What is on the Pricing page?",
  "Which pages are still under construction?",
  "Where is the founder of PromptX from?",
];

function uid() {
  return Math.random().toString(36).slice(2);
}

function classNames(...values: Array<string | null | undefined | false>) {
  return values.filter(Boolean).join(" ");
}

export default function SiteAssistantModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // heroMode: big OpenAI-style search input
  const heroMode = messages.length === 0;

  // Focus + lock scroll when open
  useEffect(() => {
    if (!open) return;

    const t = setTimeout(() => {
      inputRef.current?.focus();
    }, 0);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      clearTimeout(t);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // Auto-scroll in chat mode
  useEffect(() => {
    if (!open || heroMode) return;
    if (!scrollRef.current) return;

    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open, heroMode]);

  // Rotate example placeholder when modal is open
  useEffect(() => {
    if (!open) return;
    const id = window.setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % EXAMPLE_QUERIES.length);
    }, 4000);

    return () => clearInterval(id);
  }, [open]);

  const sendQuestion = async (question?: string) => {
    const effectiveQuestion =
      (question ?? input).trim() || EXAMPLE_QUERIES[placeholderIndex];

    if (!effectiveQuestion || loading) return;

    setError(null);
    setLoading(true);

    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      content: effectiveQuestion,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const payloadMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payloadMessages }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed (${res.status})`);
      }

      const data: { answer: string; sources?: Source[]; followups?: string[] } =
        await res.json();

      const assistantMsg: ChatMessage = {
        id: uid(),
        role: "assistant",
        content: data.answer || "Sorry — I couldn’t generate an answer.",
        sources: data.sources ?? [],
        followups: (data.followups ?? []).slice(0, 3),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "assistant",
          content:
            "Sorry — I ran into an error answering that. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitHero = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuestion();
  };

  const onSubmitChat = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuestion();
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-white backdrop-blur-sm pointer-events-none dark:bg-black" />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex justify-center" onClick={onClose}>
        <div
          className="fixed left-1/2 top-[10vh] w-[92vw] max-w-3xl -translate-x-1/2 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between  px-4 py-3 ">
              <div className="flex items-center gap-3"></div>

              <button
                onClick={onClose}
                className="rounded-lg p-2 hover:bg-black/5 dark:hover:bg-white/10"
                aria-label="Close"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.23431 4.23431C4.54673 3.9219 5.05327 3.9219 5.36569 4.23431L8 6.86863L10.6343 4.23431C10.9467 3.9219 11.4533 3.9219 11.7657 4.23431C12.0781 4.54673 12.0781 5.05327 11.7657 5.36569L9.13137 8L11.7657 10.6343C12.0781 10.9467 12.0781 11.4533 11.7657 11.7657C11.4533 12.0781 10.9467 12.0781 10.6343 11.7657L8 9.13137L5.36569 11.7657C5.05327 12.0781 4.54673 12.0781 4.23431 11.7657C3.9219 11.4533 3.9219 10.9467 4.23431 10.6343L6.86863 8L4.23431 5.36569C3.9219 5.05327 3.9219 4.54673 4.23431 4.23431Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>

            {/* Body */}
            {heroMode ? (
              // Initial OpenAI-style search hero
              <div className="px-5 pt-6 pb-5 sm:px-6 sm:pt-7 sm:pb-6">
                <form onSubmit={onSubmitHero}>
                  <div className="flex items-center gap-2   bg-white/10 px-3 py-2.5 text-sm   sm:px-4 sm:py-3 sm:text-base  outline-none dark:bg-black">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={EXAMPLE_QUERIES[placeholderIndex]}
                      className="w-full bg-transparent outline-none border-b border-gray-300 px-4 py-2  sm:py-2  "
                    />
                    <button type="submit" disabled={loading}>
                      <svg
                        width="30"
                        height="30"
                        viewBox="0 0 32 32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="ml-8 sm:ml-6 border-black  bg-black/90 rounded-full inline-flex items-center justify-center hover:bg-black/70 text-white cursor-pointer dark:text-black dark:bg-white sm:w-[35px] sm:h-[35px] hrink-0"
                      >
                        <path
                          d="M16 22L16 10M16 10L11 15M16 10L21 15"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </form>

                {error && (
                  <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                    {error}
                  </div>
                )}
              </div>
            ) : (
              // Chat view: "textarea" style output + smaller input at bottom
              <>
                <div
                  ref={scrollRef}
                  className="max-h-[55vh] overflow-y-auto px-4 pt-4 pb-3 sm:px-5"
                >
                  <div className="space-y-3">
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className={classNames(
                          "flex",
                          m.role === "user" ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={classNames(
                            "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
                            m.role === "user"
                              ? "bg-black text-white dark:bg-white dark:text-black"
                              : "bg-black/5 text-black dark:bg-white/10 dark:text-white"
                          )}
                        >
                          {m.content}

                          {m.role === "assistant" &&
                            ((m.sources?.length ?? 0) > 0 ||
                              (m.followups?.length ?? 0) > 0) && (
                              <div className="mt-3 space-y-2">
                                {!!m.sources?.length && (
                                  <div className="flex flex-wrap gap-2">
                                    {m.sources.map((s) => (
                                      <Link
                                        key={s.url}
                                        href={s.url}
                                        onClick={onClose}
                                        className="rounded-full border border-black/10 px-2 py-1 text-xs hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
                                      >
                                        {s.title}
                                      </Link>
                                    ))}
                                  </div>
                                )}

                                {!!m.followups?.length && (
                                  <div className="flex flex-wrap gap-2">
                                    {m.followups.map((f) => (
                                      <button
                                        key={f}
                                        type="button"
                                        onClick={() => sendQuestion(f)}
                                        className="rounded-full bg-black/5 px-2 py-1 text-xs hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15"
                                      >
                                        {f}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                        </div>
                      </div>
                    ))}

                    {loading && (
                      <div className="flex justify-start">
                        <div className="max-w-[85%] rounded-2xl bg-black/5 px-4 py-3 text-sm dark:bg-white/10">
                        ....
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className=" px-3 py-3 dark:border-white/10 sm:px-4 sm:py-3">
                  {error && (
                    <div className="mb-2 text-xs text-red-600 dark:text-red-400">
                      {error}
                    </div>
                  )}

                  <form
                    onSubmit={onSubmitChat}
                    className="flex items-center gap-2"
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Ask a follow-up…"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="w-full  border-b border-black/10 dark:border-white/60 px-4 py-2.5 text-sm outline-none sm:py-3 my-5"
                    />

                    <button type="submit" disabled={loading}>
                      <svg
                        width="30"
                        height="30"
                        viewBox="0 0 32 32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="ml-8 sm:ml-6 border-black  bg-black/90  rounded-full inline-flex items-center justify-center hover:bg-black/70 text-white cursor-pointer dark:text-black dark:bg-white sm:w-[35px] sm:h-[35px] hrink-0"
                      >
                        <path
                          d="M16 22L16 10M16 10L11 15M16 10L21 15"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
