"use client";
import React, { useEffect, useState, useRef } from "react";
import { useTheme } from "@/context/theme-context";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import EnhacerHeader from "./enhacerHeader";
import { useUi } from "@/context/UiContext";
import axios from "axios";
import { useChat } from "@/context/ChatContext";
import type { Message as ChatMessage } from "@/context/ChatContext";
import { API_BASE } from "@/lib/apiBase";
import { TARGET_MODELS } from "@/lib/models";
import { MarkdownRenderer } from "./MarkdownRenderer";

axios.defaults.withCredentials = true;

const API = API_BASE;

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
    targetModel,
    setTargetModel,
  } = useChat();
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [modelCategoryFilter, setModelCategoryFilter] = useState<string>("all");
  const [modelSearchQuery, setModelSearchQuery] = useState<string>("");
  const modelButtonRef = useRef<HTMLButtonElement>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);
  const activeTargetModel =
    TARGET_MODELS.find((m) => m.id === targetModel) ?? TARGET_MODELS[0];
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

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [retryingIndex, setRetryingIndex] = useState<number | null>(null);

  // Optimistic default: a brand-new user has nothing to load, so render
  // immediately. Only flipped to false (briefly) when we discover there's
  // an existing, uncached conversation that actually needs a fetch.
  const [hydrated, setHydrated] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const isSendingRef = useRef(false);
  const pendingAssistantCountRef = useRef<number | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeAiJobIdRef = useRef<string | null>(null);
  const stopTypingRef = useRef(false);
  const sendAbortControllerRef = useRef<AbortController | null>(null);
  const showLanding = hydrated && messages.length === 0;

  // Stop polling if the component unmounts (e.g. user navigates away) mid-response
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await axios.get(`${API}/user/me`, {
          withCredentials: true,
        });
        if (res.data?.success) {
          // Backend returns { success, data: { isGuest } }. Treat guests as logged out.
          setIsLoggedIn(!res.data?.data?.isGuest);
        } else {
          setIsLoggedIn(false);
        }
      } catch {
        setIsLoggedIn(false);
      }
    }

    checkSession();
  }, []);

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      if (typeof navigator !== "undefined" && navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // Fallback without requiring browser permission
    }

    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.top = "-9999px";
      textarea.style.left = "-9999px";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand("copy");
      document.body.removeChild(textarea);
      return success;
    } catch {
      return false;
    }
  };

  const handleCopy = async (text: string, index?: number) => {
    const success = await copyToClipboard(text);
    if (success && typeof index === "number") {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const handleRegenerate = async (index: number) => {
    if (loading || isSendingRef.current) return;

    const lastUserMessage = [...messages]
      .slice(0, index)
      .reverse()
      .find((m) => m.role === "user");

    if (!lastUserMessage || !lastUserMessage.content?.trim()) return;

    setRetryingIndex(index);
    try {
      await handleSend(lastUserMessage.content, lastUserMessage.attachments);
    } finally {
      setRetryingIndex(null);
    }
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
    setFeedback((prev) => ({
      ...prev,
      [index]: "dislike",
    }));
    setOpenMenuIndex(null);
  };

  //  Track object URLs to revoke later
  const objectUrlsRef = useRef<Set<string>>(new Set());

  const resizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };
  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlsRef.current.clear();
    };
  }, []);

  const makeId = (): string => {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };

  const formatBytes = (bytes: number): string => {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.min(
      sizes.length - 1,
      Math.floor(Math.log(bytes) / Math.log(k)),
    );
    const value = bytes / Math.pow(k, i);
    const decimals = value >= 10 || i === 0 ? 0 : 1;
    return `${value.toFixed(decimals)} ${sizes[i]}`;
  };

  const addFiles = (files: FileList | File[]) => {
    const arr = Array.from(files);

    setAttachments((prev) => {
      const existing = new Set(
        prev.map((a) => `${a.file.name}-${a.file.size}-${a.file.lastModified}`),
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
    let retried = false;
    // Cache-first: if we already have messages for this conversation (e.g.
    // restored from localStorage, or passed in via loadConversation), show
    // them immediately and refresh quietly in the background instead of
    // blanking the screen with a loading state.
    const hadCachedMessages = messages.length > 0;

    async function loadMessages() {
      if (!hadCachedMessages) {
        setHydrated(false);
      }

      try {
        setLoadingMessages(true);

        let guestId = localStorage.getItem("guestId");

        // Ensure guestId exists
        if (!guestId) {
          guestId = crypto.randomUUID();
          localStorage.setItem("guestId", guestId);
        }

        const url =
          !isLoggedIn && guestId
            ? `${API}/messages/${conversationId}?guestId=${encodeURIComponent(
                guestId,
              )}`
            : `${API}/messages/${conversationId}`;

        const res = await fetch(url, { credentials: "include" });

        // If unauthorized, retry once after a short delay (handles the auth
        // cookie not being attached yet on the very first request)
        if (res.status === 401 && !retried) {
          retried = true;
          await new Promise((r) => setTimeout(r, 150));
          if (!cancelled) return loadMessages();
          return;
        }

        // This conversation no longer belongs to the current user/guest
        // (stale localStorage id, cleared cookies, etc.) — don't get stuck,
        // just start fresh instead of retrying forever.
        if (res.status === 404 || res.status === 401) {
          if (!cancelled) {
            setConversationId(null);
            setMessages([]);
          }
          return;
        }

        if (!res.ok) throw new Error("Failed to fetch messages");

        const data = await res.json();
        const messages = data?.data?.messages ?? data?.messages;

        if (!cancelled && Array.isArray(messages)) {
          setMessages(messages);
        }
      } catch (err) {
        if (!cancelled) {
          console.warn("Message load skipped (initial auth race)");
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
  }, [conversationId, isLoggedIn]);

  useEffect(() => {
    // If there is NO conversationId, this is a fresh user
    // We must immediately mark UI as hydrated so landing UI shows
    if (!conversationId) {
      setHydrated(true);
      setLoadingMessages(false);
    }
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

  //  Close model menu on outside click / Escape
  useEffect(() => {
    if (!isModelMenuOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;

      const clickedButton =
        modelButtonRef.current && target
          ? modelButtonRef.current.contains(target)
          : false;

      const clickedMenu =
        modelMenuRef.current && target
          ? modelMenuRef.current.contains(target)
          : false;

      if (!clickedButton && !clickedMenu) {
        setIsModelMenuOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsModelMenuOpen(false);
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isModelMenuOpen]);

  // Auto-resize textarea
  useEffect(() => {
    if (!textareaRef.current) return;

    const el = textareaRef.current;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [input]);

  const scrollToBottom = (): void => {
    const el = scrollContainerRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
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
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
    lineDelay = 8,
  ) => {
    setIsTyping(true);
    stopTypingRef.current = false;
    const lines = fullText.split("\n");
    let current = "";

    // Chunk lines for long prompts to maintain high frame rate
    const chunkSize = lines.length > 40 ? 3 : 1;

    for (let i = 0; i < lines.length; i += chunkSize) {
      if (stopTypingRef.current) break;

      const chunk = lines.slice(i, i + chunkSize).join("\n");
      current += (i === 0 ? "" : "\n") + chunk;

      setMessages((prev) => {
        const last = prev[prev.length - 1];

        if (last?.role === "assistant") {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...last,
            content: current,
          };
          return updated;
        }

        return prev;
      });

      await new Promise((res) => setTimeout(res, lineDelay));
    }

    // Ensure final state has complete text
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role === "assistant") {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...last,
          content: fullText,
        };
        return updated;
      }
      return prev;
    });

    setIsTyping(false);
    pendingAssistantCountRef.current = null;
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

  async function handleSend(
    overrideMessage?: string,
    overrideAttachments?: Attachment[],
  ): Promise<void> {
    if (loading || isSendingRef.current) return;

    const userMessage =
      overrideMessage !== undefined ? overrideMessage : input;
    const outgoingAttachments =
      overrideAttachments !== undefined ? overrideAttachments : attachments;

    if (!userMessage.trim() && outgoingAttachments.length === 0) return;

    isSendingRef.current = true;
    setLoading(true);

    const abortController = new AbortController();
    sendAbortControllerRef.current = abortController;

    try {
      // optimistic UI
      setMessages((prev) => {
        pendingAssistantCountRef.current = prev.length + 1;
        return [
          ...prev,
          {
            role: "user",
            content: userMessage,
            attachments: outgoingAttachments.length
              ? outgoingAttachments
              : undefined,
          },
        ];
      });

      if (overrideMessage === undefined) {
        setInput("");
        setAttachments([]);
      }

      // A brand-new chat has no conversationId yet — rather than awaiting a
      // separate POST /conversations first (an extra network round trip
      // that made a new user's first message feel slow), the backend now
      // creates the conversation inline as part of /chat/send and hands
      // back its id.
      let activeConversationId = conversationId;

      const gid = localStorage.getItem("guestId");

      const chatUrl =
        gid && !isLoggedIn
          ? `${API}/chat/send?guestId=${gid}`
          : `${API}/chat/send`;

      let res: Response;

      const hasUploadableFiles = outgoingAttachments.some(
        (a) => a?.file && typeof a.file === "object" && "name" in a.file,
      );

      if (hasUploadableFiles) {
        const formData = new FormData();

        if (activeConversationId) {
          formData.append("conversationId", activeConversationId);
        }

        formData.append("content", userMessage);
        formData.append("targetModel", targetModel);

        outgoingAttachments.forEach((a) => {
          if (a?.file && typeof a.file === "object" && "name" in a.file) {
            formData.append("files", a.file);
          }
        });

        res = await fetch(chatUrl, {
          method: "POST",
          body: formData,
          credentials: "include",
          signal: abortController.signal,
        });
      } else {
        res = await fetch(chatUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            conversationId: activeConversationId || undefined,
            content: userMessage,
            targetModel,
          }),
          signal: abortController.signal,
        });
      }

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      const sendResult = await res.json().catch(() => null);
      activeAiJobIdRef.current = sendResult?.data?.aiJobId ?? null;

      const returnedConversationId = sendResult?.data?.conversationId;
      if (returnedConversationId && returnedConversationId !== activeConversationId) {
        activeConversationId = returnedConversationId;
        setConversationId(returnedConversationId);
      }

      // If the API directly produced the enhanced prompt (instant fast-path)
      if (sendResult?.data?.enhancedPrompt || sendResult?.data?.message?.content) {
        const fullContent =
          sendResult.data.enhancedPrompt || sendResult.data.message.content;
        setLoading(false);
        activeAiJobIdRef.current = null;

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "",
          },
        ]);

        await typeMessage(fullContent, setMessages);
        return;
      }

      // POLLING FALLBACK with faster interval
      const MAX_POLL_ATTEMPTS = 60;
      let pollAttempts = 0;

      const stopPolling = () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      };

      pollIntervalRef.current = setInterval(async () => {
        pollAttempts += 1;

        try {
          const messagesUrl =
            gid && !isLoggedIn
              ? `${API}/messages/${activeConversationId}?guestId=${encodeURIComponent(gid)}`
              : `${API}/messages/${activeConversationId}`;

          const res = await fetch(messagesUrl, {
            credentials: "include",
            cache: "no-store",
          });

          if (!res.ok) {
            stopPolling();
            setLoading(false);
            pendingAssistantCountRef.current = null;
            activeAiJobIdRef.current = null;
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: `Error: Failed to fetch messages (${res.status})`,
              },
            ]);
            return;
          }

          const data = await res.json();

          const fetchedMessages: ChatMessage[] = data?.data?.messages || [];

          const lastMessage = fetchedMessages[fetchedMessages.length - 1];

          const pendingCount = pendingAssistantCountRef.current;

          // wait for a new assistant message (not an older turn)
          if (
            pendingCount !== null &&
            fetchedMessages.length > pendingCount &&
            lastMessage?.role === "assistant" &&
            lastMessage.content?.trim()
          ) {
            stopPolling();
            setLoading(false);
            activeAiJobIdRef.current = null;

            const fullContent = lastMessage.content;
            const messagesForTyping = fetchedMessages.map((m, idx) =>
              idx === fetchedMessages.length - 1 ? { ...m, content: "" } : m,
            );

            setMessages(messagesForTyping);
            await typeMessage(fullContent, setMessages);
            return;
          }

          if (pollAttempts >= MAX_POLL_ATTEMPTS) {
            stopPolling();
            setLoading(false);
            pendingAssistantCountRef.current = null;
            activeAiJobIdRef.current = null;
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content:
                  "Error: The AI is taking longer than expected to respond. Please try again in a moment.",
              },
            ]);
          }
        } catch (err) {
          console.warn("Message polling stopped:", err);
          stopPolling();
          setLoading(false);
          pendingAssistantCountRef.current = null;
          activeAiJobIdRef.current = null;
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "Error: Backend server is not reachable",
            },
          ]);
        }
      }, 500);
    } catch (err) {
      // The user hitting "Stop" while this initial request was still in
      // flight also lands here (aborting it rejects the fetch) — handleStop
      // already reset all the UI state, so there's nothing left to do.
      if ((err as Error)?.name === "AbortError") {
        return;
      }

      // Reached only when sending/creating the conversation itself failed,
      // before the polling loop (which manages its own loading state) ever
      // started — without this, the "thinking" indicator would stay stuck
      // on screen forever and the input would stay disabled.
      setLoading(false);
      pendingAssistantCountRef.current = null;
      activeAiJobIdRef.current = null;
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Error: " + (err as Error).message,
        },
      ]);
    } finally {
      sendAbortControllerRef.current = null;
      isSendingRef.current = false;
      textareaRef.current?.focus();
    }
  }

  // Interrupts a response that's still being generated: stops polling for
  // it, cuts off the typing animation wherever it is, and best-effort tells
  // the backend to cancel the underlying AI job (skips it if still queued,
  // aborts the in-flight request to the model if it's already running).
  const handleStop = async (): Promise<void> => {
    stopTypingRef.current = true;

    sendAbortControllerRef.current?.abort();
    sendAbortControllerRef.current = null;

    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    setLoading(false);
    setIsTyping(false);
    pendingAssistantCountRef.current = null;

    const jobId = activeAiJobIdRef.current;
    activeAiJobIdRef.current = null;

    if (!jobId) return;

    try {
      const gid = localStorage.getItem("guestId");
      const cancelUrl =
        gid && !isLoggedIn
          ? `${API}/chat/cancel/${jobId}?guestId=${gid}`
          : `${API}/chat/cancel/${jobId}`;

      await fetch(cancelUrl, { method: "POST", credentials: "include" });
    } catch (err) {
      console.warn("Failed to cancel AI job:", err);
    }
  };

  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading) handleSend();
    }
  };

  useEffect(() => {
    const isMobile = window.innerWidth < 640;

    // Close sidebar by default on mobile
    if (isMobile) {
      setIsNavOpen(false);
    }
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;

      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    });
  }, [isNavOpen]);

  return (
    <div className="flex w-full h-screen h-dvh overflow-hidden relative">
      <EnhacerHeader />

      {/* Chat Messages Area */}
      <div className="flex flex-col flex-1 min-h-0">
        {/* Visually hidden but crawlable/accessible page heading */}
        <h1 className="sr-only">AI Prompt Enhancer</h1>

        <div
          ref={scrollContainerRef}
          data-lenis-prevent="true"
          onScroll={handleScroll}
          className={`flex-1 w-full min-h-0 overflow-y-auto overflow-x-hidden custom-scroll ${
            showLanding ? "flex flex-col" : ""
          }`}
          style={{
            WebkitOverflowScrolling: "touch",
            overscrollBehaviorY: "contain",
            overscrollBehaviorX: "none",
            paddingLeft: "1rem",
            paddingRight: "1rem",
            boxSizing: "border-box",
          }}
        >
          <div
            className={`relative w-full max-w-3xl mx-auto flex flex-col ${
              showLanding
                ? "flex-1 min-h-full items-center justify-center p-0"
                : "min-h-full px-3 sm:px-4 pt-4 sm:pt-6 pb-40 sm:pb-48"
            }`}
            style={{
              paddingBottom: showLanding
                ? undefined
                : "calc(10rem + env(safe-area-inset-bottom))",
              boxSizing: "border-box",
            }}
          >
            {!hydrated ? (
              // Skeleton placeholder — only ever shown when we know there's
              // an existing, uncached conversation to fetch.
              <div className="space-y-6 py-4 px-0 mt-5 animate-pulse" aria-hidden="true">
                {[
                  { align: "justify-end", width: "w-40" },
                  { align: "justify-start", width: "w-72" },
                  { align: "justify-end", width: "w-28" },
                ].map((row, i) => (
                  <div key={i} className={`flex ${row.align}`}>
                    <div
                      className={`h-9 rounded-2xl bg-gray-100 dark:bg-neutral-800 ${row.width}`}
                    />
                  </div>
                ))}
              </div>
            ) : showLanding ? (
              // Landing View - Centered
              <div className="flex-1 flex flex-col items-center justify-center my-auto py-12 pointer-events-none text-center">
                <div className="flex flex-col items-center justify-center gap-5 text-center">
                  <Image
                    src="/promptx-logo-black.png"
                    width={80}
                    height={80}
                    alt="PromptX logo"
                    className="object-contain h-12 w-auto sm:h-14 opacity-75 dark:hidden"
                  />
                  <Image
                    src="/promptx-logo-white.png"
                    width={80}
                    height={80}
                    alt="PromptX logo"
                    className="object-contain h-12 w-auto sm:h-14 opacity-75 hidden dark:block"
                  />
                  <div className="text-xl sm:text-2xl md:text-3xl text-neutral-900 font-medium dark:text-neutral-100 tracking-tight">
                    What can I help with?
                  </div>
                </div>
              </div>
            ) : (
              // Chat Messages
              <div className="space-y-6 py-4 px-0 pointer-events-auto mt-5">
                {messages.map((message, index) => {
                  const isErrorMessage =
                    message.role === "assistant" &&
                    message.content?.trim().startsWith("Error:");

                  return (
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
                          title={copiedIndex === index ? "Copied!" : "Copy"}
                          onClick={() => handleCopy(message.content, index)}
                          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          {copiedIndex === index ? (
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              className="text-emerald-600 dark:text-emerald-400"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : (
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
                          )}
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
                      className={`relative ${
                        isErrorMessage
                          ? "w-fit max-w-[85%] sm:max-w-[75%] bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900 rounded-2xl px-4 py-2.5"
                          : message.role === "user"
                            ? "w-fit max-w-[85%] sm:max-w-[75%] bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700/60 rounded-2xl px-4 py-2.5 shadow-xs"
                            : "w-full max-w-full text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-950/60 border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl p-4 sm:p-5 shadow-xs"
                      }`}
                    >
                      {/* Show attachments inside the chat bubble */}
                      {message.attachments?.length ? (
                        <div className="mb-3 flex flex-wrap gap-2">
                          {message.attachments.map((a) => (
                            <a
                              key={a.id}
                              href={a.objectUrl}
                              target="_blank"
                              rel="noreferrer"
                              download={a.file.name}
                              className="flex items-center gap-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 px-2.5 py-1.5 text-xs text-neutral-800 dark:text-neutral-200"
                              title={a.file.name}
                            >
                              {a.kind === "image" ? (
                                <img
                                  src={a.objectUrl}
                                  alt={a.file.name}
                                  className="w-8 h-8 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="opacity-80">
                                    <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-6Z" stroke="currentColor" strokeWidth="1.6" />
                                    <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.6" />
                                  </svg>
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="text-xs font-medium truncate max-w-40">{a.file.name}</div>
                                <div className="text-[10px] text-neutral-500">{formatBytes(a.file.size)}</div>
                              </div>
                            </a>
                          ))}
                        </div>
                      ) : null}

                      {/* Assistant Card Top Bar */}
                      {message.role === "assistant" && !isErrorMessage && (
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-100 dark:border-neutral-900 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10.5px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-900 px-2 py-0.5 rounded border border-neutral-200/60 dark:border-neutral-800/60">
                              {activeTargetModel?.label || "ChatGPT"}
                            </span>
                            <span className="text-[11px] text-neutral-400 hidden sm:inline">
                              Production Prompt
                            </span>
                          </div>
                          <button
                            onClick={() => handleCopy(message.content, index)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                              copiedIndex === index
                                ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                                : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 border-neutral-200 dark:border-neutral-800"
                            }`}
                            title="Copy full prompt"
                          >
                            {copiedIndex === index ? (
                              <>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                </svg>
                                <span>Copy Prompt</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {/* Content */}
                      {message.role === "assistant" ? (
                        isErrorMessage ? (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap flex items-start gap-1.5">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5">
                              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
                              <path d="M12 7.5V13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                              <circle cx="12" cy="16.2" r="1" fill="currentColor" />
                            </svg>
                            <span>{message.content}</span>
                          </p>
                        ) : (
                          <div className="relative">
                            <MarkdownRenderer content={message.content} />
                            {isTyping && index === messages.length - 1 && (
                              <span className="inline-block w-1.5 h-4 ml-1 bg-current animate-pulse align-middle" />
                            )}
                          </div>
                        )
                      ) : (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">
                          {message.content}
                        </p>
                      )}
                      {/* Assistant actions at bottom of card */}
                      {message.role === "assistant" &&
                        !isErrorMessage &&
                        !(isTyping && index === messages.length - 1) && (
                          <div className="flex items-center justify-between pt-3 mt-4 border-t border-neutral-100 dark:border-neutral-900 text-xs">
                            <div className="flex items-center gap-1 sm:gap-2">
                              {/* Retry / Regenerate */}
                              <button
                                onClick={() => handleRegenerate(index)}
                                disabled={loading}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 transition-all cursor-pointer group/retry disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Retry / Regenerate prompt"
                              >
                                <svg
                                  width="13"
                                  height="13"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  className={`${
                                    loading && retryingIndex === index
                                      ? "animate-spin text-neutral-900 dark:text-neutral-100"
                                      : "group-hover/retry:-rotate-180 transition-transform duration-300"
                                  }`}
                                >
                                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                                  <path d="M21 3v5h-5" />
                                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                                  <path d="M3 21v-5h5" />
                                </svg>
                                <span>
                                  {loading && retryingIndex === index
                                    ? "Retrying..."
                                    : "Retry"}
                                </span>
                              </button>
                            </div>

                            <div className="flex items-center gap-1 sm:gap-1.5">
                              {/* Like */}
                              <button
                                onClick={() => handleLike(index)}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                                  feedback[index] === "like"
                                    ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 border-transparent"
                                }`}
                                title="Good response"
                              >
                                <svg
                                  width="13"
                                  height="13"
                                  viewBox="0 0 24 24"
                                  fill={feedback[index] === "like" ? "currentColor" : "none"}
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M7 10v12" />
                                  <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
                                </svg>
                              </button>

                              {/* Dislike */}
                              <button
                                onClick={() => handleDislike(index)}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                                  feedback[index] === "dislike"
                                    ? "text-rose-700 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800"
                                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 border-transparent"
                                }`}
                                title="Bad response"
                              >
                                <svg
                                  width="13"
                                  height="13"
                                  viewBox="0 0 24 24"
                                  fill={feedback[index] === "dislike" ? "currentColor" : "none"}
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M17 14V2" />
                                  <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
                                </svg>
                              </button>

                              <div className="relative">
                                <button
                                  onClick={() =>
                                    setOpenMenuIndex(
                                      openMenuIndex === index ? null : index,
                                    )
                                  }
                                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                  title="More options"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <circle cx="12" cy="12" r="1" />
                                    <circle cx="19" cy="12" r="1" />
                                    <circle cx="5" cy="12" r="1" />
                                  </svg>
                                </button>

                                {/* Dropdown */}
                                {openMenuIndex === index && (
                                  <div className="absolute right-0 top-8 z-50 w-36 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg p-1">
                                    <button
                                      onClick={() => handleReport(index)}
                                      className="w-full text-left px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                                    >
                                      Report issue
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                  );
                })}

                {loading && !isTyping && messages.length > 0 && (
                  <div className="flex justify-start px-2">
                    <div className="flex items-center gap-1 rounded-2xl px-4 py-3">
                      <span
                        className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-500 rounded-full typing-dot"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-500 rounded-full typing-dot"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-500 rounded-full typing-dot"
                        style={{ animationDelay: "300ms" }}
                      />
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
          className="sticky bottom-0  bg-white/80 dark:bg-black/80 backdrop-blur border-t border-gray-200 dark:border-neutral-700"
          style={{
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          <div
            className="w-full max-w-3xl mx-auto py-3 overflow-visible"
            style={{
              paddingLeft: "1rem",
              paddingRight: "1rem",
              boxSizing: "border-box",
            }}
          >
            {/*  relative wrapper so popup anchors */}
            <div
              className="relative overflow-visible flex flex-col gap-1 border border-gray-200 dark:border-neutral-600 rounded-3xl w-full shadow-[0_2px_10px_rgba(0,0,0,0.06)] focus-within:border-gray-300 dark:focus-within:border-neutral-500 transition-colors bg-white dark:bg-[#0f0f0f] px-3 py-1 sm:px-4 sm:py-1.5 box-border"
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
                  className="absolute bottom-full left-3 mb-2 w-56 rounded-2xl border border-gray-200 dark:border-neutral-600 bg-white dark:bg-[#0f0f0f] shadow-xl p-2 "
                >
                  <button
                    type="button"
                    className="w-full rounded-xl px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                    onClick={() => {
                      imageInputRef.current?.click();
                      setIsUploadMenuOpen(false);
                    }}
                  >
                    {/* <span className="inline-flex items-center justify-center w-5 h-5 rounded-lg  dark:bg-gray-300 ">
                      <Image
                        src="./camera-svgrepo-com.svg"
                        alt="File-Image"
                        width={100}
                        height={50}
                      ></Image>
                    </span> */}
                    Upload photo
                  </button>

                  <button
                    type="button"
                    className="w-full rounded-xl px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 z-50"
                    onClick={() => {
                      fileInputRef.current?.click();
                      setIsUploadMenuOpen(false);
                    }}
                  >
                    {/* <span className="inline-flex items-center justify-center w-5 h-5 rounded-lg  dark:bg-gray-300 ">
                      <Image
                        src="./file-alt-svgrepo-com.svg"
                        alt="File-Image"
                        width={100}
                        height={50}
                      ></Image>
                    </span> */}
                    Upload file
                  </button>

                  <div className="px-3 py-2 text-[11px] text-gray-500 dark:text-gray-400">
                    Tip: You can also drag & drop files here.
                  </div>
                </motion.div>
              )}

              {/* Attachment chips preview */}
              {attachments.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1 px-1">
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

                {/* Target-model selector: which LLM the enhanced prompt is for */}
                <div className="relative shrink-0">
                  <button
                    ref={modelButtonRef}
                    type="button"
                    onClick={() => setIsModelMenuOpen((v) => !v)}
                    className="flex items-center gap-1 rounded-full border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/70 px-2.5 py-1 text-[12px] font-medium text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-neutral-600 transition-colors cursor-pointer"
                    aria-haspopup="listbox"
                    aria-expanded={isModelMenuOpen}
                    title="Which LLM will you use this prompt with?"
                  >
                    <span className="truncate max-w-24 sm:max-w-none">
                      {activeTargetModel.label}
                    </span>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      className={`shrink-0 transition-transform duration-150 ${
                        isModelMenuOpen ? "rotate-180" : ""
                      }`}
                    >
                      <path
                        d="M6 9l6 6 6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {isModelMenuOpen && (
                    <motion.div
                      ref={modelMenuRef}
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      role="listbox"
                      className="absolute bottom-full left-0 mb-2.5 w-80 sm:w-96 max-w-[calc(100vw-32px)] rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-[#0f0f0f] shadow-2xl p-2.5 z-50 flex flex-col"
                      style={{ maxHeight: "min(440px, calc(100vh - 140px))" }}
                    >
                      {/* Header with Title and Search */}
                      <div className="shrink-0 pb-2 border-b border-gray-100 dark:border-neutral-800">
                        <div className="flex items-center justify-between px-1 pb-1.5">
                          <span className="text-[11px] font-semibold tracking-wider uppercase text-gray-400 dark:text-neutral-500">
                            Target AI Model
                          </span>
                          <span className="text-[10px] text-gray-400 dark:text-neutral-500 font-mono">
                            {
                              TARGET_MODELS.filter((m) => {
                                const matchesCat =
                                  modelCategoryFilter === "all" ||
                                  m.category === modelCategoryFilter;
                                const matchesQ =
                                  modelSearchQuery.trim() === "" ||
                                  m.label
                                    .toLowerCase()
                                    .includes(modelSearchQuery.toLowerCase()) ||
                                  m.description
                                    .toLowerCase()
                                    .includes(modelSearchQuery.toLowerCase());
                                return matchesCat && matchesQ;
                              }).length
                            }{" "}
                            of {TARGET_MODELS.length}
                          </span>
                        </div>

                        {/* Search Input */}
                        <div className="relative px-0.5 mb-2">
                          <input
                            type="text"
                            placeholder="Search models (e.g. o3, claude, flux)..."
                            value={modelSearchQuery}
                            onChange={(e) => setModelSearchQuery(e.target.value)}
                            className="w-full text-xs rounded-xl px-2.5 py-1.5 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-black dark:text-white placeholder-gray-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition"
                          />
                          {modelSearchQuery && (
                            <button
                              type="button"
                              onClick={() => setModelSearchQuery("")}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs cursor-pointer"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {/* Category Filter Pills */}
                        <div className="flex items-center gap-1 px-0.5 overflow-x-auto scrollbar-none">
                          {[
                            { id: "all", label: "All" },
                            { id: "text", label: "Text" },
                            { id: "reasoning", label: "Reasoning" },
                            { id: "image", label: "Image" },
                            { id: "video", label: "Video" },
                          ].map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setModelCategoryFilter(cat.id)}
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors shrink-0 cursor-pointer ${
                                modelCategoryFilter === cat.id
                                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                                  : "text-gray-500 hover:text-gray-800 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-800"
                              }`}
                            >
                              {cat.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Scrollable Model List */}
                      <div className="flex-1 overflow-y-auto overscroll-contain pt-1.5 pr-0.5 space-y-1">
                        {(() => {
                          const filtered = TARGET_MODELS.filter((m) => {
                            const matchesCat =
                              modelCategoryFilter === "all" ||
                              m.category === modelCategoryFilter;
                            const matchesQ =
                              modelSearchQuery.trim() === "" ||
                              m.label
                                .toLowerCase()
                                .includes(modelSearchQuery.toLowerCase()) ||
                              m.description
                                .toLowerCase()
                                .includes(modelSearchQuery.toLowerCase());
                            return matchesCat && matchesQ;
                          });

                          if (filtered.length === 0) {
                            return (
                              <div className="py-6 text-center text-xs text-gray-400 dark:text-neutral-500">
                                No models match &ldquo;{modelSearchQuery}&rdquo;
                              </div>
                            );
                          }

                          const getCategoryBadgeClass = (category?: string) => {
                            switch (category) {
                              case "reasoning":
                                return "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800/40";
                              case "image":
                                return "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/40";
                              case "video":
                                return "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800/40";
                              default:
                                return "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800/40";
                            }
                          };

                          return filtered.map((m) => {
                            const isSelected = m.id === activeTargetModel.id;
                            return (
                              <button
                                key={m.id}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => {
                                  setTargetModel(m.id);
                                  setIsModelMenuOpen(false);
                                }}
                                className={`w-full rounded-xl px-2.5 py-2 text-left flex items-start justify-between gap-2.5 transition-colors cursor-pointer ${
                                  isSelected
                                    ? "bg-gray-100 dark:bg-neutral-800/90 ring-1 ring-gray-300 dark:ring-neutral-600"
                                    : "hover:bg-gray-50 dark:hover:bg-neutral-900/80"
                                }`}
                              >
                                <span className="min-w-0 flex-1">
                                  <span className="flex items-center gap-1.5 mb-0.5">
                                    <span className="block text-xs font-semibold text-black dark:text-white truncate">
                                      {m.label}
                                    </span>
                                    {m.category && (
                                      <span
                                        className={`text-[9px] uppercase font-mono px-1.5 py-0.2 rounded border ${getCategoryBadgeClass(
                                          m.category
                                        )}`}
                                      >
                                        {m.category}
                                      </span>
                                    )}
                                  </span>
                                  <span className="block text-[11px] leading-snug text-gray-500 dark:text-gray-400">
                                    {m.description}
                                  </span>
                                </span>

                                {isSelected && (
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    className="shrink-0 text-black dark:text-white mt-0.5"
                                  >
                                    <path
                                      d="M5 13l4 4L19 7"
                                      stroke="currentColor"
                                      strokeWidth="2.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                )}
                              </button>
                            );
                          });
                        })()}
                      </div>
                    </motion.div>
                  )}

                </div>

                <textarea
                  ref={textareaRef}
                  rows={1}
                  placeholder='Describe what you want your LLM to do, e.g. "LinkedIn post about my first internship"'
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);

                    requestAnimationFrame(() => {
                      const el = textareaRef.current;
                      if (!el) return;
                      el.style.height = "auto";
                      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
                    });
                  }}
                  onKeyDown={handleKeyPress}
                  className="
    w-full
    box-border
    text-[15px]
    leading-5.5
    outline-none
    bg-transparent
    text-black
    dark:text-white
    placeholder-neutral-400
    dark:placeholder-neutral-500
    resize-none
    overflow-hidden
    min-h-5.5
    max-h-30
    py-1
  "
                />
                <button
                  className="flex items-center gap-2 shrink-0"
                  onClick={() => {
                    if (loading || isTyping) {
                      handleStop();
                    } else {
                      handleSend();
                      setIsNavOpen(false);
                    }
                  }}
                  disabled={
                    !(loading || isTyping) &&
                    input.trim().length === 0 &&
                    attachments.length === 0
                  }
                  aria-label={loading || isTyping ? "Stop generating" : "Send message"}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={`bg-black text-white dark:bg-white dark:text-black rounded-full border w-9 h-9 sm:w-10 sm:h-10 py-2 cursor-pointer transition-opacity ${
                      !(loading || isTyping) &&
                      input.trim().length === 0 &&
                      attachments.length === 0
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-black/80 dark:hover:bg-white/80"
                    }`}
                  >
                    {loading || isTyping ? (
                      <rect x="6" y="6" width="8" height="8" rx="1.5" />
                    ) : (
                      <path d="M8.99992 16V6.41407L5.70696 9.70704C5.31643 10.0976 4.68342 10.0976 4.29289 9.70704C3.90237 9.31652 3.90237 8.6835 4.29289 8.29298L9.29289 3.29298L9.36907 3.22462C9.76184 2.90427 10.3408 2.92686 10.707 3.29298L15.707 8.29298L15.7753 8.36915C16.0957 8.76192 16.0731 9.34092 15.707 9.70704C15.3408 10.0732 14.7618 10.0958 14.3691 9.7754L14.2929 9.70704L10.9999 6.41407V16C10.9999 16.5523 10.5522 17 9.99992 17C9.44764 17 8.99992 16.5523 8.99992 16Z" />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            <div className="text-center text-[11px] font-medium text-neutral-400 dark:text-neutral-500 mt-2">
              Describe a task, not a question. PromptX writes prompts; it does not answer general questions.
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Enhancer;
