"use client";
import React, { useEffect, useState, useRef } from "react";
import { useTheme } from "@/context/theme-context";
import Image from "next/image";
import { motion } from "framer-motion";
import EnhacerHeader from "./enhacerHeader";
import { useUi } from "@/context/UiContext";
import axios from "axios";
import { useChat } from "@/context/ChatContext";
import type { Message as ChatMessage } from "@/context/ChatContext";

axios.defaults.withCredentials = true;

interface Attachment {
  id: string;
  file: File;
  objectUrl: string; // local preview/download URL
  kind: "image" | "file";
}

function Enhancer() {
  const {
    messages,
    setMessages,
    conversationId,
    setConversationId,
    refreshHistory,
    guestId,
  } = useChat();
  const { theme } = useTheme();
  const { isNavOpen, setIsNavOpen, isOpen, setIsOpen } = useUi();

  const [input, setInput] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState(false);

  //  Attachments state
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploadMenuOpen, setIsUploadMenuOpen] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // --- Mac trackpad hard-fix: force wheel/gesture scrolling ---
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      // If the container can scroll, force it
      const canScroll = el.scrollHeight > el.clientHeight;
      if (!canScroll) return;

      e.preventDefault();
      el.scrollTop += e.deltaY;
    };

    // Safari needs non-passive listener to allow preventDefault
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, []);
  const isAtBottomRef = useRef(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  //  Hidden inputs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  //  Popup refs for outside-click close
  const uploadButtonRef = useRef<HTMLButtonElement>(null);
  const uploadMenuRef = useRef<HTMLDivElement>(null);
  const [feedback, setFeedback] = useState<
    Record<number, "like" | "dislike" | null>
  >({});
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);

  const [hydrated, setHydrated] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const isSendingRef = useRef(false);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await axios.get("/api/me", { withCredentials: true });
        if (res.data?.success) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch {
        setIsLoggedIn(false);
      }
    }

    checkSession();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    } catch {
      alert("Copy failed");
    }
  };

  const handleRegenerate = async (index: number) => {
    const lastUserMessage = [...messages]
      .slice(0, index)
      .reverse()
      .find((m) => m.role === "user");

    if (!lastUserMessage) return;

    setInput(lastUserMessage.content);
    await handleSend();
  };

  const handleLike = (index: number) => {
    setFeedback((prev) => ({
      ...prev,
      [index]: prev[index] === "like" ? null : "like",
    }));
  };

  const handleDislike = (index: number) => {
    setFeedback((prev) => ({
      ...prev,
      [index]: prev[index] === "dislike" ? null : "dislike",
    }));
  };

  const handleReport = (index: number) => {
    alert("Reported! We'll review this response.");
    setOpenMenuIndex(null);
  };

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
  useEffect(() => {
    if (!conversationId || isSendingRef.current) return;

    let cancelled = false;

    async function loadMessages() {
      try {
        setLoadingMessages(true);

        const guestId = localStorage.getItem("guestId");

        const url = guestId
          ? `/api/message/get?conversationId=${conversationId}&guestId=${guestId}`
          : `/api/message/get?conversationId=${conversationId}`;

        const res = await fetch(url, { credentials: "include" });

        if (!res.ok) throw new Error("Failed to fetch messages");

        const data = await res.json();

        if (!cancelled && Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load messages", err);
        }
      } finally {
        if (!cancelled) {
          setHydrated(true);
          setLoadingMessages(false);
        }
      }
    }

    loadMessages();

    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  useEffect(() => {
    if (conversationId) {
      localStorage.setItem("conversationId", conversationId);
    }
  }, [conversationId]);

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

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const threshold = 80; // px
    const atBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold;

    isAtBottomRef.current = atBottom;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isAtBottomRef.current) {
      scrollToBottom();
    }
  }, [messages.length]);

  useEffect(() => {
    let guestId = localStorage.getItem("guestId");

    if (!guestId) {
      guestId = crypto.randomUUID();
      localStorage.setItem("guestId", guestId);
    }
  }, []);

  const typeMessage = async (
    fullText: string,
    setMessages: any,
    delay = 15
  ) => {
    setIsTyping(true);
    let current = "";

    for (let i = 0; i < fullText.length; i++) {
      current += fullText[i];

      setMessages((prev: any[]) => {
        const last = prev[prev.length - 1];

        // If last is assistant, update it
        if (last?.role === "assistant") {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...last,
            content: current,
          };
          return updated;
        }

        // Otherwise, do nothing
        return prev;
      });

      await new Promise((res) => setTimeout(res, delay));
    }
    setIsTyping(false);
  };

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
    if (loading || isSendingRef.current) return;
    isSendingRef.current = true;

    const hasText = input.trim().length > 0;
    const hasFiles = attachments.length > 0;

    if (!hasText && !hasFiles) {
      isSendingRef.current = false;
      return;
    }

    const userMessage = input;
    const outgoingAttachments = attachments.slice();

    setInput("");
    setAttachments([]);
    setIsUploadMenuOpen(false);

    setMessages((prev: ChatMessage[]) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
        attachments: outgoingAttachments.length
          ? outgoingAttachments
          : undefined,
      } as ChatMessage,
    ]);

    setLoading(true);

    try {
      let activeConversationId: string | null = conversationId;

      // ✅ ALWAYS create conversation if missing
      if (!activeConversationId) {
        const guestId = localStorage.getItem("guestId");

        const res = await fetch("/api/conversation/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            title: userMessage.slice(0, 30),
            guestId,
          }),
        });

        if (!res.ok) throw new Error("Failed to create conversation");

        const data = await res.json();

        if (!data.conversationId) throw new Error("Invalid conversation ID");

        activeConversationId = data.conversationId as string;
        setConversationId(activeConversationId);
        localStorage.setItem("conversationId", activeConversationId);
        await refreshHistory();
      }

      // ❌ HARD BLOCK if still null
      if (!activeConversationId) {
        throw new Error("Conversation ID missing");
      }
      const safeConversationId = activeConversationId as string;

      // Save user message
      const saveUserRes = await fetch("/api/message/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: safeConversationId,
          role: "user",
          content: userMessage,
        }),
      });

      if (messages.length === 0) {
        const shortTitle = input.split(" ").slice(0, 6).join(" ");

        await axios.post("/api/conversation/update-title", {
          conversationId,
          title: shortTitle,
          guestId,
        });
      }

      if (!saveUserRes.ok) throw new Error("Failed to save user message");

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

      const finalText = data?.response || "No response generated";

      // Insert empty assistant bubble first
      setMessages((prev: ChatMessage[]) => [
        ...prev,
        { role: "assistant", content: "" } as ChatMessage,
      ]);

      // Set loading to false BEFORE typing starts
      setLoading(false);
      // Type it like ChatGPT
      await typeMessage(finalText, setMessages);

      //  Save assistant message
      const saveAssistantRes = await fetch("/api/message/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: safeConversationId,
          role: "assistant",
          content: finalText,
        }),
      });

      if (!saveAssistantRes.ok) {
        console.error("Failed to save assistant message");
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Error: " + (err as Error).message,
        } as ChatMessage,
      ]);
    } finally {
      isSendingRef.current = false;
      setLoading(false);
      textareaRef.current?.focus();
    }
  }

  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading) handleSend();
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

  const showLanding = hydrated && messages.length === 0;
  const showChat = hydrated && messages.length > 0;

  return (
    <div className="flex h-screen relative">
      <EnhacerHeader />

      {/* Chat Messages Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="w-full flex-1 min-h-0 overflow-y-auto custom-scroll"
          style={{
            WebkitOverflowScrolling: "auto",
            overscrollBehaviorY: "auto",
            overscrollBehaviorX: "none",
            touchAction: "pan-y",
            pointerEvents: "auto",
          }}
        >
          <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-40">
            {!hydrated ? (
              <div className="flex items-center justify-center min-h-[calc(100vh-14rem)]">
                <div className="text-gray-500 dark:text-gray-400 animate-pulse">
                  Loading conversation...
                </div>
              </div>
            ) : showLanding ? (
              // Landing View
              <div className="flex flex-col items-center justify-center min-h-[calc(100vh-14rem)]">
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
                    className="w-24 h-24 md:h-16 opacity-30"
                  />
                </div>

                <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-black font-medium mb-5 dark:text-white text-center">
                  What can I help with?
                </div>
              </div>
            ) : (
              // Chat Messages
              <div className="space-y-6 py-4 pointer-events-auto">
                {messages.map((message, index) => (
                  <div
                    key={message._id || `${message.role}-${index}`}
                    className={`flex gap-2 group relative ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {/* User actions: Copy & Edit (ChatGPT style, hover-only, outside bubble) */}
                    {message.role === "user" && (
                      <div className="absolute -bottom-6 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                        {/* Copy */}
                        <button
                          title="Copy"
                          onClick={() => handleCopy(message.content)}
                          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="stroke-2 size-3.5"
                          >
                            <rect
                              x="3"
                              y="8"
                              width="13"
                              height="13"
                              rx="4"
                              stroke="currentColor"
                            ></rect>
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M13 2.00004L12.8842 2.00002C12.0666 1.99982 11.5094 1.99968 11.0246 2.09611C9.92585 2.31466 8.95982 2.88816 8.25008 3.69274C7.90896 4.07944 7.62676 4.51983 7.41722 5.00004H9.76392C10.189 4.52493 10.7628 4.18736 11.4147 4.05768C11.6802 4.00488 12.0228 4.00004 13 4.00004H14.6C15.7366 4.00004 16.5289 4.00081 17.1458 4.05121C17.7509 4.10066 18.0986 4.19283 18.362 4.32702C18.9265 4.61464 19.3854 5.07358 19.673 5.63807C19.8072 5.90142 19.8994 6.24911 19.9488 6.85428C19.9992 7.47112 20 8.26343 20 9.40004V11C20 11.9773 19.9952 12.3199 19.9424 12.5853C19.8127 13.2373 19.4748 13.8114 19 14.2361V16.5829C20.4795 15.9374 21.5804 14.602 21.9039 12.9755C22.0004 12.4907 22.0002 11.9334 22 11.1158L22 11V9.40004V9.35725C22 8.27346 22 7.3993 21.9422 6.69141C21.8826 5.96256 21.7568 5.32238 21.455 4.73008C20.9757 3.78927 20.2108 3.02437 19.27 2.545C18.6777 2.24322 18.0375 2.1174 17.3086 2.05785C16.6007 2.00002 15.7266 2.00003 14.6428 2.00004L14.6 2.00004H13Z"
                              fill="currentColor"
                            ></path>
                          </svg>
                        </button>

                        {/* Edit */}
                        <button
                          title="Edit"
                          onClick={() => {
                            setInput(message.content);
                            textareaRef.current?.focus();
                          }}
                          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="stroke-2 size-3.5"
                          >
                            <path
                              d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M14.06 6.19L17.81 9.94"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                    <div
                      className={`relative max-w-[80%] ${
                        message.role === "user"
                          ? "bg-gray-100 text-black dark:bg-neutral-700 dark:text-white"
                          : "text-black dark:text-white"
                      } rounded-2xl px-4 py-3`}
                    >
                      {/*  Show attachments inside the chat bubble */}
                      {message.attachments?.length ? (
                        <div className="mt-0 flex flex-wrap gap-2">
                          {message.attachments.map((a) => (
                            <a
                              key={a.id}
                              href={a.objectUrl}
                              target="_blank"
                              rel="noreferrer"
                              download={a.file.name}
                              className={`flex items-center gap-2 rounded-xl border-2 px-2 py-2 ${
                                message.role === "user"
                                  ? "border-white bg-white/10 dark:border-gray-600/30"
                                  : "border-gray-900 dark:border-gray-700 bg-white dark:bg-black/20"
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
                      {message.content ? (
                        <p className="text-sm whitespace-pre-wrap wrap-break-word">
                          {message.content}
                        </p>
                      ) : null}
                      {/* Assistant actions outside bubble */}
                      {message.role === "assistant" &&
                        !(isTyping && index === messages.length - 1) && (
                          <div className="flex flex-row justify-start gap-1 opacity-40 hover:opacity-100 transition">
                            <button
                              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                              title="Regenerate"
                              onClick={() => handleRegenerate(index)}
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="stroke-2 size-4"
                              >
                                <path
                                  d="M4 20V15H4.31241M4.31241 15H9M4.31241 15C5.51251 18.073 8.50203 20.25 12 20.25C15.8582 20.25 19.0978 17.6016 20 14.0236M20 4V9H19.6876M19.6876 9H15M19.6876 9C18.4875 5.92698 15.498 3.75 12 3.75C8.14184 3.75 4.90224 6.3984 4 9.9764"
                                  stroke="currentColor"
                                ></path>
                              </svg>
                            </button>
                            <button
                              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                              title="Copy"
                              onClick={() => handleCopy(message.content)}
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="stroke-2 size-4"
                              >
                                <rect
                                  x="3"
                                  y="8"
                                  width="13"
                                  height="13"
                                  rx="4"
                                  stroke="currentColor"
                                ></rect>
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M13 2.00004L12.8842 2.00002C12.0666 1.99982 11.5094 1.99968 11.0246 2.09611C9.92585 2.31466 8.95982 2.88816 8.25008 3.69274C7.90896 4.07944 7.62676 4.51983 7.41722 5.00004H9.76392C10.189 4.52493 10.7628 4.18736 11.4147 4.05768C11.6802 4.00488 12.0228 4.00004 13 4.00004H14.6C15.7366 4.00004 16.5289 4.00081 17.1458 4.05121C17.7509 4.10066 18.0986 4.19283 18.362 4.32702C18.9265 4.61464 19.3854 5.07358 19.673 5.63807C19.8072 5.90142 19.8994 6.24911 19.9488 6.85428C19.9992 7.47112 20 8.26343 20 9.40004V11C20 11.9773 19.9952 12.3199 19.9424 12.5853C19.8127 13.2373 19.4748 13.8114 19 14.2361V16.5829C20.4795 15.9374 21.5804 14.602 21.9039 12.9755C22.0004 12.4907 22.0002 11.9334 22 11.1158L22 11V9.40004V9.35725C22 8.27346 22 7.3993 21.9422 6.69141C21.8826 5.96256 21.7568 5.32238 21.455 4.73008C20.9757 3.78927 20.2108 3.02437 19.27 2.545C18.6777 2.24322 18.0375 2.1174 17.3086 2.05785C16.6007 2.00002 15.7266 2.00003 14.6428 2.00004L14.6 2.00004H13Z"
                                  fill="currentColor"
                                ></path>
                              </svg>
                            </button>
                            <button
                              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                              title="Like"
                              onClick={() => handleLike(index)}
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="stroke-2 size-4"
                              >
                                <path
                                  d="M7 20H3V9H5.5C6.32843 9 7 9.67157 7 10.5V20ZM7 20H16.2062C17.8403 20 19.257 18.8692 19.6192 17.2757L20.8059 12.0541C21.1614 10.4896 19.9724 9 18.3681 9H14.5L15.1142 5.31454C15.3162 4.10294 14.3818 3 13.1535 3C12.4402 3 11.7816 3.38222 11.4277 4.00155L8.43188 9.24421C8.16482 9.71157 7.6678 10 7.12952 10H6.91465"
                                  stroke="currentColor"
                                  fill="none"
                                ></path>
                              </svg>
                            </button>
                            <button
                              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                              title="Dislike"
                              onClick={() => handleDislike(index)}
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="stroke-2 size-4"
                              >
                                <path
                                  d="M7 4H3V15H5.5C6.32843 15 7 14.3284 7 13.5V4ZM7 4H16.2062C17.8403 4 19.257 5.13082 19.6192 6.72433L20.8059 11.9459C21.1614 13.5104 19.9724 15 18.3681 15H14.5L15.1142 18.6855C15.3162 19.8971 14.3818 21 13.1535 21C12.4402 21 11.7816 20.6178 11.4277 19.9984L8.43188 14.7558C8.16482 14.2884 7.6678 14 7.12952 14H6.91465"
                                  stroke="currentColor"
                                  fill="none"
                                ></path>
                              </svg>
                            </button>
                            <div className="relative">
                              <button
                                onClick={() =>
                                  setOpenMenuIndex(
                                    openMenuIndex === index ? null : index
                                  )
                                }
                                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                                title="More"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="lucide lucide-ellipsis size-4"
                                >
                                  <circle cx="12" cy="12" r="1" />
                                  <circle cx="19" cy="12" r="1" />
                                  <circle cx="5" cy="12" r="1" />
                                </svg>
                              </button>

                              {/* Dropdown */}
                              {openMenuIndex === index && (
                                <div className="absolute right-0 top-7 z-50 w-40 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black shadow-sm">
                                  <button
                                    onClick={() => handleReport(index)}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                                  >
                                    Report issue
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                ))}

                {loading && !isTyping && messages.length > 0 && (
                  <div className="flex justify-start px-4 py-2">
                    <div className="w-2 h-2 bg-neutral-800 rounded-full animate-breathe" />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Bar (fixed bottom) */}
        <div className="sticky bottom-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur border-t border-gray-200 dark:border-neutral-700">
          <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-3">
            {/*  relative wrapper so popup anchors */}
            <div
              className="relative flex flex-col gap-2 border border-gray-300 dark:border-neutral-600 rounded-3xl w-full shadow-md bg-white dark:bg-[#0f0f0f] px-3 py-2"
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
                  className="absolute bottom-full left-3 mb-2 w-56 rounded-2xl border border-gray-200 dark:border-neutral-600 bg-white dark:bg-[#0f0f0f] shadow-xl p-2 z-50"
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
                      className="flex items-center gap-2 rounded-2xl border border-gray-200 dark:border-neutral-600 bg-white/60 dark:bg-black/20 px-2 py-2"
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
                  onKeyDown={handleKeyPress}
                  className="text-sm sm:text-[16px] w-full outline-none bg-transparent text-black dark:text-white dark:placeholder-gray-400 resize-none overflow-hidden leading-6"
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

            {showLanding && (
              <div className="text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-4">
                By using PromptX and chatting with the AI assistant, you agree
                to our{" "}
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
    </div>
  );
}

export default Enhancer;
