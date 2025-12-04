"use client";
import React, { useEffect, useState, useRef } from "react";
import Header from "../home/header";
import { useUi } from "@/context/UiContext";
import { useTheme } from "@/context/theme-context";
import Image from "next/image";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function Enhancer() {
  const { isNavOpen, setIsNavOpen } = useUi();
  const { theme, setTheme } = useTheme();
  const [isFeatureOpen, setIsFeatureOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isPersonasOpen, setIsPersonasOpen] = useState<boolean>(false);
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const personasRef = useRef<HTMLDivElement>(null);

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
    if (!input.trim()) return;

    const userMessage: string = input;
    setInput("");

    // Add user message to chat
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          persona: selectedPersona,
        }),
      });

      const data = await res.json();

      // Add AI response to chat
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
    }

    setLoading(false);
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

  const personas = [
    {
      id: "creative",
      name: "Creative Writer",
      icon: "",
      description: "Enhanced creative and storytelling capabilities",
    },
    {
      id: "technical",
      name: "Technical Expert",
      icon: "",
      description: "Deep technical knowledge and code optimization",
    },
    {
      id: "business",
      name: "Business Analyst",
      icon: "",
      description: "Strategic thinking and business insights",
    },
    {
      id: "educator",
      name: "Educator",
      icon: "",
      description: "Clear explanations and teaching approach",
    },
    {
      id: "researcher",
      name: "Researcher",
      icon: "",
      description: "Thorough research and fact-checking",
    },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        personasRef.current &&
        !personasRef.current.contains(event.target as Node)
      ) {
        setIsPersonasOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const isMobile: boolean = window.innerWidth < 640;
    if (isMobile && !document.referrer.includes(window.location.hostname)) {
      setIsNavOpen(false);
    }
  }, [setIsNavOpen]);

  useEffect(() => {
    setIsNavOpen(false);
  }, []);

  const isChatMode: boolean = messages.length > 0;

  return (
    <div className="flex flex-col h-screen dark:bg-black bg-white">
      <Header />
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto  ">
        <div
          className={`max-w-3xl mx-auto px-4 sm:px-6  transition-transform duration-300 ease-in-out   ${
            isChatMode ? "pt-20 pb-32" : ""
          }
         ${isNavOpen ? " md:translate-x-20 translate-x-70 " : ""} `}
        >
          {!isChatMode ? (
            // Landing View
            <div className="flex flex-col items-center justify-center min-h-[80vh] ">
              <div className="flex justify-center mb-8 ">
                <Image
                  src={
                    theme === "light"
                      ? "/Rectangle.png"
                      : "/AdobeStock_450013573_Preview 1.png"
                  }
                  width={100}
                  height={100}
                  alt="promptx logo"
                  className="w-24 h-24 md:h-16 opacity-10 "
                />
              </div>
              <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-black font-medium mb-5 dark:text-white text-center ">
                What can I help with?
              </div>

              {/* Feature Pills */}
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3  w-full max-w-4xl ">
                <div className="px-2 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2 border border-black/20 rounded-full hover:bg-gray-200/30 cursor-pointer text-xs sm:text-sm dark:border-white/20 dark:hover:bg-gray-800/30">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-secondary shrink-0"
                    strokeWidth="2"
                  >
                    <path
                      d="M19.2987 8.84667C15.3929 1.86808 5.44409 5.76837 7.08971 11.9099C8.01826 15.3753 12.8142 14.8641 13.2764 12.8592C13.6241 11.3504 10.2964 12.3528 10.644 10.844C11.1063 8.839 15.9022 8.32774 16.8307 11.793C18.5527 18.2196 7.86594 22.4049 4.71987 15.2225"
                      strokeWidth="5"
                      strokeLinecap="round"
                      className="stroke-black/10 dark:stroke-white/20 transition-[opacity,transform] duration-200 origin-center opacity-0 scale-0"
                    ></path>
                    <path
                      d="M2 13.8236C4.5 22.6927 18 21.3284 18 14.0536C18 9.94886 11.9426 9.0936 10.7153 11.1725C9.79198 12.737 14.208 12.6146 13.2847 14.1791C12.0574 16.2581 6 15.4029 6 11.2982C6 3.68585 20.5 2.2251 22 11.0945"
                      stroke="currentColor"
                      className="transition-transform duration-200 eas-out origin-center rotate-0"
                    ></path>
                  </svg>
                  <span className="whitespace-nowrap">DeepSearch</span>
                </div>
                <div className="px-2 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2 border border-black/20 rounded-full hover:bg-gray-200/30 cursor-pointer text-xs sm:text-sm dark:border-white/20 dark:hover:bg-gray-800/30">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-secondary shrink-0"
                    strokeWidth="2"
                  >
                    <path
                      d="M12 4H8C5.79086 4 4 5.79086 4 8V16C4 18.2091 5.79086 20 8 20H16C18.2091 20 20 18.2091 20 16V12"
                      stroke="currentColor"
                    ></path>
                    <path
                      d="M4 15.3333L8 12L16.4706 20"
                      stroke="currentColor"
                    ></path>
                    <circle
                      cx="14"
                      cy="10"
                      r="1.75"
                      fill="currentColor"
                    ></circle>
                    <path
                      d="M21.0355 5.49989L18.5 5.49989M18.5 5.49989L15.9645 5.49989M18.5 5.49989L18.5 2.96436M18.5 5.49989L18.5 8.03542"
                      stroke="currentColor"
                      strokeLinecap="square"
                    ></path>
                  </svg>
                  <span className="whitespace-nowrap">Create Image</span>
                </div>
                <div className="relative" ref={personasRef}>
                  <div
                    onClick={() => setIsPersonasOpen(!isPersonasOpen)}
                    className="px-2 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2 border border-black/20 rounded-full hover:bg-gray-200/30 cursor-pointer text-xs sm:text-sm dark:border-white/20 dark:hover:bg-gray-800/30"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-secondary shrink-0"
                      strokeWidth="2"
                    >
                      <path
                        d="M3.6665 15.6666V4.33331H7.99984L11.9998 6.33331H20.3332V15.6666C20.3332 17.8758 18.5423 19.6666 16.3332 19.6666H7.6665C5.45736 19.6666 3.6665 17.8758 3.6665 15.6666Z"
                        stroke="currentColor"
                      ></path>
                      <path d="M3 11H21" stroke="currentColor"></path>
                    </svg>
                    <span className="whitespace-nowrap">
                      {selectedPersona
                        ? personas.find((p) => p.id === selectedPersona)?.name
                        : "Pick Personas"}
                    </span>
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={`text-secondary transition-transform duration-200 shrink-0 ${
                        isPersonasOpen ? "rotate-180" : ""
                      }`}
                      strokeWidth="2"
                    >
                      <path
                        d="M6 9L12 15L18 9"
                        stroke="currentColor"
                        strokeLinecap="square"
                      ></path>
                    </svg>
                  </div>

                  {/* Dropdown Menu */}
                  {isPersonasOpen && (
                    <div className="absolute top-full mt-2 left-0 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl z-50 overflow-hidden pointer-events-auto">
                      <div className="p-3 border-b border-gray-200 dark:border-gray-700 ">
                        <h3 className="text-sm font-semibold text-black dark:text-white">
                          Select AI Persona
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Choose how the AI should respond
                        </p>
                      </div>
                      <div
                        className="max-h-80 overflow-y-auto overscroll-contain"
                        onWheel={(e) => e.stopPropagation()}
                      >
                        {personas.map((persona) => (
                          <div
                            key={persona.id}
                            onClick={() => {
                              setSelectedPersona(persona.id);
                              setIsPersonasOpen(false);
                            }}
                            className={`p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
                              selectedPersona === persona.id
                                ? "bg-gray-100 dark:bg-gray-800"
                                : ""
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-2xl">{persona.icon}</span>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-sm font-medium text-black dark:text-white">
                                    {persona.name}
                                  </h4>
                                  {selectedPersona === persona.id && (
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      className="text-green-500"
                                    >
                                      <path
                                        d="M20 6L9 17L4 12"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {persona.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {selectedPersona && (
                        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                          <button
                            onClick={() => {
                              setSelectedPersona(null);
                              setIsPersonasOpen(false);
                            }}
                            className="w-full text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-medium"
                          >
                            Clear Selection
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="px-2 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2 border border-black/20 rounded-full hover:bg-gray-200/30 cursor-pointer text-xs sm:text-sm dark:border-white/20 dark:hover:bg-gray-800/30">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-audio-lines text-secondary shrink-0"
                  >
                    <path d="M2 10v3"></path>
                    <path d="M6 6v11"></path>
                    <path d="M10 3v18"></path>
                    <path d="M14 8v7"></path>
                    <path d="M18 5v13"></path>
                    <path d="M22 10v3"></path>
                  </svg>
                  <span className="whitespace-nowrap">Voice</span>
                </div>
              </div>
            </div>
          ) : (
            // Chat Messages
            <div className="space-y-6 py-4 ">
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
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Fixed Input Area at Bottom */}
      <div
        className={`border-t  border-gray-200 dark:border-gray-800 bg-white   transition-transform duration-300 ease-in-out dark:bg-black ${
          isNavOpen ? " md:translate-x-20 translate-x-70 " : ""
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
                <path d="M8.99992 16V6.41407L5.70696 9.70704C5.31643 10.0976 4.68342 10.0976 4.29289 9.70704C3.90237 9.31652 3.90237 8.6835 4.29289 8.29298L9.29289 3.29298L9.36907 3.22462C9.76184 2.90427 10.3408 2.92686 10.707 3.29298L15.707 8.29298L15.7753 8.36915C16.0957 8.76192 16.0731 9.34092 15.707 9.70704C15.3408 10.0732 14.7618 10.0958 14.3691 9.7754L14.2929 9.70704L10.9999 6.41407V16C10.9999 16.5523 10.5522 17 9.99992 17C9.44764 17 8.99992 16.5523 8.99992 16Z"></path>
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
