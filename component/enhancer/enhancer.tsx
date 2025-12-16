"use client";
import React, { useEffect, useState, useRef } from "react";
import Header from "../home/header";
import { useUi } from "@/context/UiContext";
import { useTheme } from "@/context/theme-context";
import Image from "next/image";
import { motion } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function Enhancer() {
  const { isNavOpen, setIsNavOpen } = useUi();
  const { theme } = useTheme();

  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [input]);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function handleSend(): Promise<void> {
    if (!input.trim() || loading) return;

    const userMessage: string = input;
    setInput("");

    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage, // ✅ persona removed
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data?.response || "No response generated",
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error: " + (err as Error).message },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
      setIsNavOpen(false);
    }
  };

  useEffect(() => {
    const isMobile: boolean = window.innerWidth < 640;
    if (isMobile && !document.referrer.includes(window.location.hostname)) {
      setIsNavOpen(false);
    }
  }, [setIsNavOpen]);

  useEffect(() => {
    setIsNavOpen(false);
  }, [setIsNavOpen]);

  const isChatMode: boolean = messages.length > 0;

  return (
    <div className="flex flex-col h-screen dark:bg-black bg-white">
      <Header />

      {/* Chat Messages Area */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="flex-1 overflow-y-auto">
          <div
            className={`max-w-3xl mx-auto px-4 sm:px-6 transition-transform duration-300 ease-in-out ${
              isChatMode ? "pt-20 pb-32" : ""
            } ${isNavOpen ? "md:translate-x-20 translate-x-70" : ""}`}
          >
            {!isChatMode ? (
              // Landing View
              <div className="flex flex-col items-center justify-center min-h-[80vh]">
                <div className="flex justify-center mb-8">
                  <Image
                    src={
                      theme === "light"
                        ? "/Rectangle.png"
                        : "/AdobeStock_450013573_Preview 1.png"
                    }
                    width={100}
                    height={100}
                    alt="promptx logo"
                    className="w-24 h-24 md:h-16 opacity-10"
                  />
                </div>

                <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-black font-medium mb-5 dark:text-white text-center">
                  What can I help with?
                </div>

                {/* ✅ Feature pills removed (DeepSearch / Create Image / Personas / Voice) */}
              </div>
            ) : (
              // Chat Messages
              <div className="space-y-6 py-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] ${
                        message.role === "user"
                          ? "bg-black text-white dark:bg-white dark:text-black"
                          : "bg-gray-100 dark:bg-gray-800/60 text-black dark:text-white"
                      } rounded-2xl px-4 py-3 shadow-sm`}
                    >
                      <p className="text-sm whitespace-pre-wrap wrap-break-word">
                        {message.content}
                      </p>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-sm">
                      <div className="flex gap-1">
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Input Bar (fixed bottom) */}
      <div
        className={`fixed bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black transition-transform duration-300 ease-in-out ${
          isNavOpen ? "md:translate-x-20 translate-x-70" : ""
        }`}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-3xl w-full px-2 sm:px-3 py-2 flex items-center gap-1 sm:gap-2 shadow-lg dark:bg-[#0f0f0f]">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="m-1 sm:m-2 font-medium cursor-pointer text-black dark:text-white shrink-0"
            >
              <path
                d="M10 9V15C10 16.1046 10.8954 17 12 17V17C13.1046 17 14 16.1046 14 15V7C14 4.79086 12.2091 3 10 3V3C7.79086 3 6 4.79086 6 7V15C6 18.3137 8.68629 21 12 21V21C15.3137 21 18 18.3137 18 15V8"
                stroke="currentColor"
              />
            </svg>

            <textarea
              ref={textareaRef}
              rows={1}
              placeholder="Ask anything"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="text-sm sm:text-[16px] w-full outline-none text-black dark:text-white dark:bg-[#0f0f0f] dark:placeholder-gray-400 resize-none overflow-hidden"
            />

            <button
              className="flex items-center gap-2 shrink-0"
              onClick={() => {
                handleSend();
                setIsNavOpen(false);
              }}
              disabled={!input.trim() || loading}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="currentColor"
                className={`bg-black text-white dark:bg-white dark:text-black rounded-full border w-8 h-8 sm:w-10 sm:h-10 py-2 cursor-pointer transition-opacity ${
                  !input.trim() || loading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-black/80 dark:hover:bg-white/80"
                }`}
              >
                <path d="M8.99992 16V6.41407L5.70696 9.70704C5.31643 10.0976 4.68342 10.0976 4.29289 9.70704C3.90237 9.31652 3.90237 8.6835 4.29289 8.29298L9.29289 3.29298L9.36907 3.22462C9.76184 2.90427 10.3408 2.92686 10.707 3.29298L15.707 8.29298L15.7753 8.36915C16.0957 8.76192 16.0731 9.34092 15.707 9.70704C15.3408 10.0732 14.7618 10.0958 14.3691 9.7754L14.2929 9.70704L10.9999 6.41407V16C10.9999 16.5523 10.5522 17 9.99992 17C9.44764 17 8.99992 16.5523 8.99992 16Z" />
              </svg>
            </button>
          </div>

          {!isChatMode && (
            <div className="text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-4">
              By using PromptX and chatting with the AI assistant, you agree to
              our{" "}
              <a href="/terms" className="underline cursor-pointer">
                Terms
              </a>{" "}
              and acknowledge our{" "}
              <a href="/privacy" className="underline cursor-pointer">
                Privacy Policy
              </a>
              . You can manage your{" "}
              <a href="/cookies" className="underline cursor-pointer">
                Cookie Preferences
              </a>{" "}
              anytime.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Enhancer;