"use client";
import React, { useEffect, useState, useRef } from "react";
import Header from "../home/header";
import { useUi } from "@/context/UiContext";
import { useTheme } from "@/context/theme-context";
import Image from "next/image";
import { motion } from "framer-motion";

interface Attachment {
  id: string;
  file: File;
  objectUrl: string; // local preview/download URL
  kind: "image" | "file";
}

interface Message {
  role: "user" | "assistant";
  content: string;
  attachments?: Attachment[];
}

function Enhancer() {
  
  const { isNavOpen, setIsNavOpen } = useUi();
  const { theme } = useTheme();

  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  //  Attachments state
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploadMenuOpen, setIsUploadMenuOpen] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  //  Hidden inputs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  //  Popup refs for outside-click close
  const uploadButtonRef = useRef<HTMLButtonElement>(null);
  const uploadMenuRef = useRef<HTMLDivElement>(null);

  //  Track object URLs to revoke later
  const objectUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlsRef.current.clear();
    };
  }, []);

  const makeId = (): string => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return (crypto as any).randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };

  const formatBytes = (bytes: number): string => {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.min(
      sizes.length - 1,
      Math.floor(Math.log(bytes) / Math.log(k))
    );
    const value = bytes / Math.pow(k, i);
    const decimals = value >= 10 || i === 0 ? 0 : 1;
    return `${value.toFixed(decimals)} ${sizes[i]}`;
  };

  const addFiles = (files: FileList | File[]) => {
    const arr = Array.from(files);

    setAttachments((prev) => {
      const existing = new Set(
        prev.map((a) => `${a.file.name}-${a.file.size}-${a.file.lastModified}`)
      );

      const next: Attachment[] = [];

      for (const file of arr) {
        const key = `${file.name}-${file.size}-${file.lastModified}`;
        if (existing.has(key)) continue;

        const objectUrl = URL.createObjectURL(file);
        objectUrlsRef.current.add(objectUrl);

        next.push({
          id: makeId(),
          file,
          objectUrl,
          kind: file.type.startsWith("image/") ? "image" : "file",
        });
      }

      return [...prev, ...next];
    });
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const target = prev.find((a) => a.id === id);
      if (target) {
        URL.revokeObjectURL(target.objectUrl);
        objectUrlsRef.current.delete(target.objectUrl);
      }
      return prev.filter((a) => a.id !== id);
    });
  };

  const handleFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    addFiles(e.target.files);
    e.target.value = ""; // allow selecting the same file again
  };

  //  Close popup on outside click / Escape
  useEffect(() => {
    if (!isUploadMenuOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;

      const clickedButton =
        uploadButtonRef.current && target
          ? uploadButtonRef.current.contains(target)
          : false;

      const clickedMenu =
        uploadMenuRef.current && target
          ? uploadMenuRef.current.contains(target)
          : false;

      if (!clickedButton && !clickedMenu) {
        setIsUploadMenuOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsUploadMenuOpen(false);
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isUploadMenuOpen]);

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

  //  Drag & drop
  const handleDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    if (e.dataTransfer?.files?.length) {
      addFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const handleDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
  };

  async function handleSend(): Promise<void> {
    if (loading) return;

    const hasText = input.trim().length > 0;
    const hasFiles = attachments.length > 0;

    if (!hasText && !hasFiles) return;

    const userMessage = input;
    const outgoingAttachments = attachments.slice();

    setInput("");
    setAttachments([]);
    setIsUploadMenuOpen(false);

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
        attachments: outgoingAttachments.length
          ? outgoingAttachments
          : undefined,
      },
    ]);

    setLoading(true);

    try {
      // Send multipart when files exist
      // NOTE: Your /api/chat must accept multipart/form-data for this to work.
      let res: Response;

      if (outgoingAttachments.length > 0) {
        const formData = new FormData();
        formData.append("message", userMessage);
        outgoingAttachments.forEach((a) => formData.append("files", a.file));

        res = await fetch("/api/chat", {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMessage }),
        });
      }

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
      textareaRef.current?.focus();
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
                    {message.content ? (
                      <p className="text-sm whitespace-pre-wrap wrap-break-word">
                        {message.content}
                      </p>
                    ) : null}

                    {/*  Show attachments inside the chat bubble */}
                    {message.attachments?.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.attachments.map((a) => (
                          <a
                            key={a.id}
                            href={a.objectUrl}
                            target="_blank"
                            rel="noreferrer"
                            download={a.file.name}
                            className={`flex items-center gap-2 rounded-xl border px-2 py-2 ${
                              message.role === "user"
                                ? "border-white/20 bg-white/10"
                                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-black/20"
                            }`}
                            title={a.file.name}
                          >
                            {a.kind === "image" ? (
                              <img
                                src={a.objectUrl}
                                alt={a.file.name}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gray-200/60 dark:bg-gray-800 flex items-center justify-center">
                                <svg
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  className="opacity-80"
                                >
                                  <path
                                    d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-6Z"
                                    stroke="currentColor"
                                    strokeWidth="1.6"
                                  />
                                  <path
                                    d="M14 2v6h6"
                                    stroke="currentColor"
                                    strokeWidth="1.6"
                                  />
                                </svg>
                              </div>
                            )}

                            <div className="min-w-0">
                              <div className="text-xs font-medium truncate max-w-[170px]">
                                {a.file.name}
                              </div>
                              <div className="text-[11px] opacity-70">
                                {formatBytes(a.file.size)}
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    ) : null}
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

      {/* Input Bar (fixed bottom) */}
      <div
        className={`fixed bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black transition-transform duration-300 ease-in-out ${
          isNavOpen ? "md:translate-x-20 translate-x-70" : ""
        }`}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          {/*  relative wrapper so popup anchors */}
          <div
            className="relative border border-gray-200 dark:border-gray-700 rounded-3xl w-full px-2 sm:px-3 py-2 shadow-lg dark:bg-[#0f0f0f]"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {/* Hidden inputs */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFilePicked}
            />
            <input
              ref={imageInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFilePicked}
            />

            {/* Popup menu */}
            {isUploadMenuOpen && (
              <motion.div
                ref={uploadMenuRef}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="absolute bottom-full left-3 mb-2 w-56 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] shadow-xl p-2 z-50"
              >
                <button
                  type="button"
                  className="w-full rounded-xl px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                  onClick={() => {
                    imageInputRef.current?.click();
                    setIsUploadMenuOpen(false);
                  }}
                >
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-lg  dark:bg-gray-300 ">
                     <Image
                      src="./camera-svgrepo-com.svg"
                      alt="File-Image"
                      width={100}
                      height={50}
                    ></Image>
                  </span>
                  Upload photo
                </button>

                <button
                  type="button"
                  className="w-full rounded-xl px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                  onClick={() => {
                    fileInputRef.current?.click();
                    setIsUploadMenuOpen(false);
                  }}
                >
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-lg  dark:bg-gray-300 ">
                    <Image
                      src="./file-alt-svgrepo-com.svg"
                      alt="File-Image"
                      width={100}
                      height={50}
                    ></Image>
                  </span>
                  Upload file
                </button>

                <div className="px-3 py-2 text-[11px] text-gray-500 dark:text-gray-400">
                  Tip: You can also drag & drop files here.
                </div>
              </motion.div>
            )}

            {/* Attachment chips preview */}
            {attachments.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2 px-1">
                {attachments.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-black/20 px-2 py-2"
                    title={a.file.name}
                  >
                    {a.kind === "image" ? (
                      <img
                        src={a.objectUrl}
                        alt={a.file.name}
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-xl  dark:bg-gray-800 flex items-center justify-center">
                        <Image
                      src="./file-alt-svgrepo-com.svg"
                      alt="File-Image"
                      width={100}
                      height={50}
                    ></Image>
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="text-xs font-medium truncate max-w-35 text-black dark:text-white">
                        {a.file.name}
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">
                        {formatBytes(a.file.size)}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="ml-1 rounded-lg p-1 text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => removeAttachment(a.id)}
                      aria-label={`Remove ${a.file.name}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Controls row */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Your SVG becomes a button */}
              <button
                ref={uploadButtonRef}
                type="button"
                onClick={() => setIsUploadMenuOpen((v) => !v)}
                className="m-1 sm:m-2 font-medium cursor-pointer text-black dark:text-white shrink-0"
                aria-label="Attach files"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M10 9V15C10 16.1046 10.8954 17 12 17V17C13.1046 17 14 16.1046 14 15V7C14 4.79086 12.2091 3 10 3V3C7.79086 3 6 4.79086 6 7V15C6 18.3137 8.68629 21 12 21V21C15.3137 21 18 18.3137 18 15V8"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

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
                disabled={
                  (input.trim().length === 0 && attachments.length === 0) ||
                  loading
                }
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`bg-black text-white dark:bg-white dark:text-black rounded-full border w-8 h-8 sm:w-10 sm:h-10 py-2 cursor-pointer transition-opacity ${
                    (input.trim().length === 0 && attachments.length === 0) ||
                    loading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-black/80 dark:hover:bg-white/80"
                  }`}
                >
                  <path d="M8.99992 16V6.41407L5.70696 9.70704C5.31643 10.0976 4.68342 10.0976 4.29289 9.70704C3.90237 9.31652 3.90237 8.6835 4.29289 8.29298L9.29289 3.29298L9.36907 3.22462C9.76184 2.90427 10.3408 2.92686 10.707 3.29298L15.707 8.29298L15.7753 8.36915C16.0957 8.76192 16.0731 9.34092 15.707 9.70704C15.3408 10.0732 14.7618 10.0958 14.3691 9.7754L14.2929 9.70704L10.9999 6.41407V16C10.9999 16.5523 10.5522 17 9.99992 17C9.44764 17 8.99992 16.5523 8.99992 16Z" />
                </svg>
              </button>
            </div>
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
