"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { useChat, type Message } from "@/context/ChatContext";
import { useTheme } from "@/context/theme-context";
import { useUi } from "@/context/UiContext";
import { apiClient } from "@/lib/apiClient";
import { API_BASE } from "@/lib/apiBase";
import LoginModal from "@/components/auth/LoginModal";

const MOBILE_BREAKPOINT = 768;
const API = API_BASE;

type UserProfile = {
  _id?: string;
  email?: string;
  name?: string;
  avatar?: string;
};

function getErrorMessage(err: unknown) {
  if (!err || typeof err !== "object") return "Unknown error";
  const e = err as Record<string, unknown>;

  const response = e["response"];
  if (response && typeof response === "object") {
    const data = (response as Record<string, unknown>)["data"];
    if (data && typeof data === "object") {
      const d = data as Record<string, unknown>;
      const maybe = d["error"] ?? d["message"];
      if (typeof maybe === "string" && maybe.trim()) return maybe;
    }
  }

  const maybeMessage = e["message"];
  if (typeof maybeMessage === "string" && maybeMessage.trim()) {
    return maybeMessage;
  }
  return "Unknown error";
}

// --- PIN ICON COMPONENT (VISIBLE + FIXED) ---
const PinIcon = ({ size = 12 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="-12 -12 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="shrink-0"
  >
    <path
      d="M-8.593,8.593 L-3.593,3.593
         M-8.593,-1.407 L-7.593,-2.407
         L-3.527,-3.085
         C-2.307,-3.288 -1.25,-4.045 -0.663,-5.134
         L0.633,-7.541
         C1.268,-8.721 2.861,-8.954 3.808,-8.007
         L8.007,-3.808
         C8.954,-2.861 8.721,-1.268 7.541,-0.633
         L5.134,0.663
         C4.045,1.25 3.288,2.307 3.085,3.527
         L2.407,7.593
         L1.407,8.593
         L-3.593,3.593
         Z"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="square"
      strokeLinejoin="miter"
    />
  </svg>
);

async function apiRenameConversation(
  conversationId: string,
  title: string,
  guestId?: string,
) {
  const res = await fetch(`${API}/conversations/${conversationId}/title`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ title, guestId }),
  });

  if (!res.ok) throw new Error("Rename failed");
}

async function apiPinConversation(
  conversationId: string,
  pin: boolean,
  guestId?: string,
) {
  const res = await fetch(`${API}/conversations/${conversationId}/pin`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ pin, guestId }),
  });

  if (!res.ok) throw new Error("Pin failed");
}

async function apiDeleteConversation(conversationId: string, guestId?: string) {
  const res = await fetch(`${API}/conversations/${conversationId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ guestId }),
  });

  const data = await res.json();

  if (!res.ok || !data?.success) {
    throw new Error(data?.error || "Delete failed");
  }

  return data;
}

function EnhacerHeader() {
  const { theme } = useTheme();
  const {
    loadConversation,
    conversationId,
    setConversationId,
    setMessages,
    startNewChat,
  } = useChat();
  const { isOpen, setIsOpen, setIsNavOpen, isLoginOpen, setIsLoginOpen } = useUi();

  const [isMobile, setIsMobile] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewMessages, setPreviewMessages] = useState<Message[]>([]);
  const [previewConversationId, setPreviewConversationId] = useState<
    string | null
  >(null);
  const previewCache = useRef<Record<string, Message[]>>({});
  const searchCache = useRef<Record<string, string>>({});
  const buttonRects = useRef<Record<string, DOMRect>>({});
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isHistoryHovered, setIsHistoryHovered] = useState(false);
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(false);
  const [openHistoryMenuId, setOpenHistoryMenuId] = useState<string | null>(
    null,
  );
  // --- RENAME MODAL STATE ---
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [renameTargetId, setRenameTargetId] = useState<string | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileSidebarOpen]);
  useEffect(() => {
    const handler = () => setOpenHistoryMenuId(null);
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [user, setUser] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  // Initialize guestId if needed
  const [stableGuestId, setStableGuestId] = useState<string | null>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let gid = localStorage.getItem("guestId");
      if (!gid) {
        gid = crypto.randomUUID();
        localStorage.setItem("guestId", gid);
      }
      setStableGuestId(gid);
    }
  }, []);

  const guestId = stableGuestId;
  const guestReady = !!guestId;
  const canFetchMessages = authChecked && (isLoggedIn || guestReady);

  const [conversations, setConversations] = useState<
    {
      _id: string;
      title: string;
      createdAt: string;
      pinnedAt?: string | null;
    }[]
  >([]);
  


  const sorted = useMemo(() => {
    return [...conversations].sort((a, b) => {
      if (a.pinnedAt && b.pinnedAt) {
        return new Date(b.pinnedAt).getTime() - new Date(a.pinnedAt).getTime();
      }
      if (a.pinnedAt) return -1;
      if (b.pinnedAt) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [conversations]);

  // --- HISTORY ACTION HANDLERS ---
  const handleRenameConversation = (id: string) => {
    const current = conversations.find((c) => c._id === id);
    setRenameTargetId(id);
    setRenameValue(current?.title || "");
    setIsRenameOpen(true);
  };

  const confirmRename = async () => {
    if (!renameTargetId || !renameValue.trim()) return;
    if (!isLoggedIn && !guestId) return;

    const prev = conversations;

    setConversations((prev) =>
      prev.map((c) =>
        c._id === renameTargetId ? { ...c, title: renameValue.trim() } : c,
      ),
    );

    try {
      await apiRenameConversation(
        renameTargetId,
        renameValue.trim(),
        isLoggedIn ? undefined : (guestId ?? undefined),
      );
    } catch (err) {
      console.error(err);
      setConversations(prev);
    }

    setIsRenameOpen(false);
    setRenameTargetId(null);
    setRenameValue("");
  };

  const handlePinConversation = async (id: string) => {
    if (!isLoggedIn && !guestId) return;

    const prev = conversations;

    const target = conversations.find((c) => c._id === id);
    const wasPinned = !!target?.pinnedAt;

    const now = new Date().toISOString();

    setConversations((prev) =>
      prev.map((c) =>
        c._id === id ? { ...c, pinnedAt: wasPinned ? null : now } : c,
      ),
    );

    try {
      await apiPinConversation(
        id,
        !wasPinned,
        isLoggedIn ? undefined : (guestId ?? undefined),
      );

      // Load history in background
      apiClient.get(`/conversations`, {
        params: isLoggedIn ? undefined : { guestId },
      }).then(res => {
        if (res.data?.success) {
          setConversations(res.data.data?.conversations || []);
        }
      }).catch(err => {
        console.error(err);
        setConversations(prev);
      });
    } catch (err) {
      console.error(err);
      setConversations(prev);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    if (!isLoggedIn && !guestId) return;

    const prev = conversations;

    // Optimistic UI update
    setConversations((prev) => prev.filter((c) => c._id !== id));

    if (conversationId === id) {
      setConversationId(null);
      setMessages([]);
    }

    try {
      // IMPORTANT: Do NOT send guestId when logged in
      await apiDeleteConversation(
        id,
        isLoggedIn ? undefined : (guestId ?? undefined),
      );

      // Load history in background
      apiClient.get(`/conversations`, {
        params: isLoggedIn ? undefined : { guestId },
      }).then(res => {
        if (res.data?.success) {
          setConversations(res.data.data?.conversations || []);
        }
      }).catch(err => {
        console.error(err);
        setConversations(prev); // rollback
      });
    } catch (err) {
      console.error(err);
      setConversations(prev); // rollback
    }
  };
  const historyScrollRef = useRef<HTMLDivElement | null>(null);
  const firstItemRef = useRef<HTMLDivElement | null>(null);
  const lastItemRef = useRef<HTMLDivElement | null>(null);
  const [historyLineHeight, setHistoryLineHeight] = useState(0);

  useEffect(() => {
    const updateHeight = () => {
      if (!firstItemRef.current || !lastItemRef.current) {
        setHistoryLineHeight(0);
        return;
      }

      const firstRect = firstItemRef.current.getBoundingClientRect();
      const lastRect = lastItemRef.current.getBoundingClientRect();

      const EXTRA_PX = 25; // extend line slightly at the bottom
      const height = lastRect.bottom - firstRect.top + EXTRA_PX;
      setHistoryLineHeight(height);
    };

    updateHeight();

    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [sorted]);

  const handleGoogleLogin = () => {
    window.location.href = `${API}/auth/google`;
  };
  // Keyboard navigation for search modal
  useEffect(() => {
    if (!isSearchModalOpen) return;
    if (!canFetchMessages) return;

    const handleKey = (e: KeyboardEvent) => {
      const filteredConversations = conversations.filter((c) => {
        const q = searchQuery.toLowerCase();
        if (!q) return true;
        if (c.title?.toLowerCase().includes(q)) return true;
        const cachedText = searchCache.current[c._id];
        if (cachedText?.includes(q)) return true;
        return false;
      });
      if (!filteredConversations.length) return;

      const index = filteredConversations.findIndex(
        (c) => c._id === previewConversationId,
      );

      if (e.key === "ArrowDown") {
        const next =
          filteredConversations[index + 1] || filteredConversations[0];
        setPreviewConversationId(next._id);
        if (previewCache.current[next._id]) {
          setPreviewMessages(previewCache.current[next._id]);
        } else {
          // fetch preview
          (async () => {
            try {
              if (!canFetchMessages) return;
              if (!isLoggedIn && !guestId) return;
              const res = await apiClient.get(`/messages/${next._id}`, {
                params: isLoggedIn ? undefined : { guestId },
              });
              if (res.data?.success) {
                const msgs = res.data.data?.messages || [];
                const last = msgs.slice(-8);
                previewCache.current[next._id] = last;
                setPreviewMessages(last);
              }
            } catch {}
          })();
        }
      }

      if (e.key === "ArrowUp") {
        const prev =
          filteredConversations[index - 1] ||
          filteredConversations[filteredConversations.length - 1];
        setPreviewConversationId(prev._id);
        if (previewCache.current[prev._id]) {
          setPreviewMessages(previewCache.current[prev._id]);
        } else {
          (async () => {
            try {
              if (!canFetchMessages) return;
              if (!isLoggedIn && !guestId) return;
              const res = await apiClient.get(`/messages/${prev._id}`, {
                params: isLoggedIn ? undefined : { guestId },
              });
              if (res.data?.success) {
                const msgs = res.data.data?.messages || [];
                const last = msgs.slice(-8);
                previewCache.current[prev._id] = last;
                setPreviewMessages(last);
              }
            } catch {}
          })();
        }
      }

      if (e.key === "Enter" && previewConversationId) {
        openConversation(previewConversationId);
        setIsSearchModalOpen(false);
      }

      if (e.key === "Escape") {
        setIsSearchModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [
    isSearchModalOpen,
    previewConversationId,
    conversations,
    searchQuery,
    canFetchMessages,
    isLoggedIn,
    guestId,
  ]);

  // Prefetch message text for searching (background)
  useEffect(() => {
    const preloadSearchData = async () => {
      if (!canFetchMessages) return;
      if (!isLoggedIn && !guestId) return;
      for (const conv of conversations) {
        if (searchCache.current[conv._id]) continue;

        try {
          if (!canFetchMessages) return;
          const res = await apiClient.get(`/messages/${conv._id}`, {
            params: isLoggedIn ? undefined : { guestId },
          });

          if (res.data?.success) {
            const msgs = res.data.data?.messages || [];
            const allText = msgs
              .map((m: { content: string }) => m.content.toLowerCase())
              .join(" ");

            searchCache.current[conv._id] = allText;
          }
        } catch (e) {
          console.error("Search preload failed", e);
        }
      }
    };

    if (isSearchModalOpen) {
      preloadSearchData();
    }
  }, [isSearchModalOpen, conversations, canFetchMessages, isLoggedIn, guestId]);

  useEffect(() => {
    if (!isSearchModalOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSearchModalOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isSearchModalOpen]);

  const onLogout = async () => {
    try {
      await apiClient.post(`/auth/logout`, {});

      setIsLoggedIn(false);
      setUserProfile(null);
      setConversations([]);
      setConversationId(null);
      setMessages([]);
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  useEffect(() => {
    if (!authChecked) return;
    if (!isLoggedIn && !guestId) return;

    const loadConversations = async () => {
      try {
        const res = await apiClient.get(`/conversations`, {
          params: isLoggedIn ? undefined : { guestId },
        });

        if (res.data?.success) {
          const convs = res.data.data?.conversations || [];
          setConversations(convs);
        }
      } catch (err: unknown) {
        console.error("Failed to load history", getErrorMessage(err));
      }
    };

    // Load conversations with a small delay to not block initial render
    const timeoutId = setTimeout(() => loadConversations(), 100);
    return () => clearTimeout(timeoutId);
  }, [authChecked, isLoggedIn, guestId]);

  const openConversation = async (id: string) => {
    if (!id) {
      console.error("Invalid conversation id");
      return;
    }
    try {
      if (!canFetchMessages) return;
      if (!isLoggedIn && !guestId) return;
      const params = isLoggedIn ? undefined : { guestId };

      const res = await apiClient.get(`/messages/${id}`, {
        params,
      });

      if (res.data?.success) {
        loadConversation(id, res.data.data?.messages || []);
      }
    } catch (err) {
      console.error("Failed to open conversation", err);
    }
  };

  const createNewChat = async () => {
    try {
      if (!isLoggedIn && !guestId) {
        console.warn("GuestId not ready, skipping create chat");
        return;
      }

      const payload = isLoggedIn ? {} : { guestId };
      const res = await apiClient.post(`/conversations`, payload);

      const newId = res.data?.data?.conversationId;
      if (!newId) {
        console.error("No conversationId returned", res.data);
        return;
      }

      // Immediately show the new chat interface
      startNewChat();
      setConversationId(newId);

      // Load history in background without blocking UI
      apiClient.get(`/conversations`, {
        params: isLoggedIn ? undefined : { guestId },
      }).then(historyRes => {
        if (historyRes.data?.success) {
          setConversations(historyRes.data.data?.conversations || []);
        }
      }).catch(err => {
        console.error("Failed to load history after creating chat", err);
      });
    } catch (err: unknown) {
      console.error("Failed to create conversation", getErrorMessage(err));
    }
  };



  const onLogin = async (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    if (loading) return;

    try {
      setLoading(true);

      const response = await apiClient.post(`/auth/login`, {
        email: user.email,
        password: user.password,
      });

      if (response.data?.success) {
        const me = await apiClient.get(`/user/me`);
        const isGuest = !!me.data?.data?.isGuest;
        const dataUser = me.data?.data?.user || null;
        setIsLoggedIn(!!me.data?.success && !!dataUser && !isGuest);
        setUserProfile(!isGuest ? (dataUser as UserProfile) : null);
        setLoginError("");
        setIsLoginOpen(false);

        // Load conversations after login
        const res = await apiClient.get(`/conversations`);
        if (res.data?.success) {
          setConversations(res.data.data?.conversations || []);
        }
      }
    } catch (error: unknown) {
      setLoginError(getErrorMessage(error) || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await apiClient.get(`/user/me`);

        if (res.data?.success && !res.data?.data?.isGuest) {
          setIsLoggedIn(true);
          setUserProfile(res.data?.data?.user || null);
        } else {
          setIsLoggedIn(false);
          setUserProfile(null);
        }
      } catch {
        setIsLoggedIn(false);
        setUserProfile(null);
      } finally {
        setAuthChecked(true);
      }
    };

    checkSession();
  }, []);

  return (
    <div className="">
      <div className="flex justify-between ">
        <div
          className={`flex flex-col transition-all duration-300 ease-(--grok-ease) pr-5 h-screen min-h-0 border-r border-gray-200 dark:border-neutral-600 z-10 bg-white dark:bg-black
  ${
    isMobile
      ? `fixed top-0 left-0 w-[60vw] max-w-105 transform ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } z-[2000]`
      : isOpen
        ? "w-60 opacity-100"
        : "w-15 opacity-100"
  }`}
          style={{ overflow: "visible" }}
        >
          <div>
            <Link href="/" aria-label="Home" className="">
              <Image
                src="/promptx-logo-black.png"
                width={30}
                height={30}
                alt="PromptX logo"
                className="ml-3 sm:ml-2.5 mt-3 h-6 w-auto object-contain dark:hidden"
              />
              <Image
                src="/promptx-logo-white.png"
                width={30}
                height={30}
                alt="PromptX logo"
                className="ml-3 sm:ml-2.5 mt-3 h-6 w-auto object-contain hidden dark:block"
              />
            </Link>
          </div>
          <div
            className={`mt-5 ml-2 flex items-center gap-1 pl-3 py-2.5 pr-5 border border-gray-200 rounded-4xl bg-gray-100 transition-all dark:bg-neutral-800 ${
              isOpen ? "opacity-100" : "opacity-0 pointer-events-none  "
            }`}
          >
            {/* Search icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width={20}
              height={20}
              className="shrink-0 text-gray-900"
            >
              <g transform="translate(12 11.5)">
                <path
                  stroke={theme === "light" ? "#000000" : "#ffffff"}
                  strokeWidth={2}
                  fill="none"
                  d="M7,-0.75 C7,1.39 6.132,3.328 4.73,4.73
           C3.328,6.132 1.39,7 -0.75,7
           C-5.03,7 -8.5,3.53 -8.5,-0.75
           C-8.5,-5.03 -5.03,-8.5 -0.75,-8.5
           C3.53,-8.5 7,-5.03 7,-0.75z
           M4.73,4.73 L8.5,8.5"
                />
              </g>
            </svg>

            {/* Textarea */}
            <textarea
              value={searchQuery}
              readOnly
              onFocus={() => {
                setIsSearchModalOpen(true);
                setSearchQuery("");
              }}
              onClick={() => {
                setIsSearchModalOpen(true);
                setSearchQuery("");
              }}
              placeholder="Search"
              rows={1}
              aria-label="Search"
              className="flex-1 resize-none bg-transparent outline-none text-[15px] ml-1.5 placeholder-gray-400"
            />
          </div>
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              createNewChat();
            }}
            className={`mt-2 ml-2 flex flex-row items-center gap-1 pl-3 py-2.5 pr-5  rounded-2xl  transition-all duration-200 ease-(--grok-ease) hover:-translate-y-1px][ dark:hover:bg-neutral-700/60 cursor-pointer
            ${isOpen ? "hover:bg-gray-100" : ""}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width={20}
              height={20}
              className="shrink-0 flex items-center justify-center w-5 h-5"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <clipPath id="lottie_clip_7">
                  <rect width={24} height={24} x={0} y={0} />
                </clipPath>

                <clipPath id="lottie_clip_12">
                  <path d="M-12.222,-12.222 L-12.111,12.111 L12.056,12.056 L12.083,-12.083 Z" />
                </clipPath>
              </defs>

              <g clipPath="url(#lottie_clip_7)">
                <g clipPath="url(#lottie_clip_12)" transform="translate(12 12)">
                  <path
                    d="M-2,-8 C-3.864,-8 -4.796,-8 -5.531,-7.696 C-6.511,-7.29 -7.29,-6.511 -7.696,-5.531 C-8,-4.796 -8,-3.864 -8,-2 V1.6 C-8,3.84 -8,4.96 -7.564,5.816 C-7.181,6.569 -6.569,7.181 -5.816,7.564 C-4.96,8 -3.84,8 -1.6,8 H2 C3.864,8 4.796,8 5.531,7.696 C6.511,7.29 7.29,6.511 7.696,5.531 C8,4.796 8,3.864 8,2"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    fill="none"
                  />
                </g>

                <g transform="translate(14.561 9.439)">
                  <path
                    d="M4.939,-1.939 L-2.121,5.121 C-2.402,5.402 -2.784,5.561 -3.182,5.561 H-5.561 V3.182 C-5.561,2.784 -5.402,2.402 -5.121,2.121 L1.939,-4.939 C2.767,-5.767 4.111,-5.767 4.939,-4.939 C5.767,-4.111 5.767,-2.767 4.939,-1.939 Z"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    fill="none"
                  />
                </g>
              </g>
            </svg>
            {isOpen && (
              <span className="ml-2 flex  flex-row font-medium text-[15px] ">
                Chat
              </span>
            )}
          </div>
          {/* --- HISTORY MENU BUTTON --- */}
          <div
            className={`mt-1 ml-2 flex flex-row items-center gap-2 pl-3 py-2.5 pr-5 rounded-2xl transition-all duration-800  hover:-translate-y dark:hover:bg-neutral-700/60 cursor-pointer ${
              isOpen ? "hover:bg-gray-100" : ""
            }`}
          >
            <div
              className="flex items-center gap-2 w-7"
              onMouseEnter={() => setIsHistoryHovered(true)}
              onMouseLeave={() => setIsHistoryHovered(false)}
            >
              {!isHistoryHovered && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  preserveAspectRatio="xMidYMid meet"
                  className="shrink-0 flex items-center justify-center w-5 h-5 text-gray-900 dark:text-white"
                >
                  <defs>
                    <clipPath id="history_clip">
                      <rect width="24" height="24" x="0" y="0" />
                    </clipPath>
                  </defs>
                  <g clipPath="url(#history_clip)">
                    <g transform="translate(12 14)">
                      <path
                        d="M0,2 C0,2 0,-2 0,-2"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="butt"
                        strokeLinejoin="miter"
                      />
                    </g>
                    <g transform="translate(12 12)">
                      <path
                        d="M0,-1 C0.55,-1 1,-0.55 1,0 C1,0.55 0.55,1 0,1 C-0.55,1 -1,0.55 -1,0 C-1,-0.55 -0.55,-1 0,-1z"
                        fill="currentColor"
                      />
                    </g>
                    <g transform="translate(13.5 10.5)">
                      <path
                        d="M-1.5,1.5 C-1.5,1.5 1.5,-1.5 1.5,-1.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="butt"
                        strokeLinejoin="miter"
                      />
                    </g>
                    <g transform="translate(12.029 11.75)">
                      <path
                        d="M-8.471,1.25 C-7.976,5.473 -4.385,8.75 -0.029,8.75 C4.665,8.75 8.471,4.944 8.471,0.25 C8.471,-4.444 4.665,-8.25 -0.029,-8.25 C-3.276,-8.25 -6.098,-6.43 -7.529,-3.754 M-2.529,-3.75 C-2.529,-3.75 -7.529,-3.75 -7.529,-3.75 C-7.529,-3.75 -7.529,-8.75 -7.529,-8.75"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="butt"
                        strokeLinejoin="miter"
                      />
                    </g>
                  </g>
                </svg>
              )}
              {isHistoryHovered && (
                <svg
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsHistoryCollapsed((v) => !v);
                  }}
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`stroke-3 transition-transform duration-200 cursor-pointer ${
                    isHistoryCollapsed ? "-rotate-90" : "rotate-90"
                  }`}
                >
                  <path
                    d="M9 6L15 12L9 18"
                    stroke="currentColor"
                    strokeLinecap="square"
                  />
                </svg>
              )}
            </div>
            {isOpen && (
              <div className="flex flex-row items-center gap-3 w-full">
                <span className="font-medium text-[15px] ">History</span>
              </div>
            )}
          </div>
          <div className="mt-0 ml-2 flex flex-col relative items-start gap-1 pl-2 py-2 pr-3 rounded-2xl transition-all duration-200 w-full flex-1 z-20" style={{ overflow: "visible" }}>
            {isOpen && !isHistoryCollapsed && (
              <div
                className="absolute left-5 top-1.25 w-px bg-gray-200 dark:bg-neutral-700 transition-all duration-300"
                style={{
                  height: `${historyLineHeight}px`,
                  WebkitMaskImage:
                    "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
                  maskImage:
                    "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
                }}
              />
            )}
            {isOpen && (
              <div
                ref={historyScrollRef}
                className={`ml-4 -mt-2 flex flex-col gap-0.5 text-md w-full pr-2 hide-scrollbar overscroll-contain p-1 rounded-2xl transition-all duration-300 ease-(--grok-ease) ${
                  isHistoryCollapsed
                    ? "opacity-0 -translate-y-2 pointer-events-none max-h-0 overflow-hidden"
                    : "opacity-100"
                }`}
                style={{
                  WebkitOverflowScrolling: "touch",
                  scrollBehavior: "smooth",
                  overscrollBehavior: "contain",
                  maxHeight: "calc(100vh - 300px)",
                  overflowY: "auto",
                }}
              >
                {sorted.length === 0 && (
                  <span className="text-gray-400 px-3 py-2">No chats yet</span>
                )}

                {sorted.map((conv, index) => {
                  const isActive = conversationId === conv._id;

                  return (
                    <div
                      ref={
                        index === 0
                          ? firstItemRef
                          : index === sorted.length - 1
                            ? lastItemRef
                            : null
                      }
                      key={conv._id}
                      className="relative group"
                    >
                      <div
                        onClick={async () => {
                          if (isMobile) setIsMobileSidebarOpen(false);

                          if (!canFetchMessages) return;

                          setIsSearchModalOpen(true);
                          setPreviewConversationId(conv._id);

                          if (previewCache.current[conv._id]) {
                            setPreviewMessages(previewCache.current[conv._id]);
                            return;
                          }

                          try {
                            if (!isLoggedIn && !guestId) return;
                            const res = await apiClient.get(
                              `/messages/${conv._id}`,
                              {
                                params: isLoggedIn ? undefined : { guestId },
                              },
                            );

                            if (res.data?.success) {
                              const msgs = res.data.data?.messages || [];
                              const last = msgs.slice(-8);
                              previewCache.current[conv._id] = last;
                              setPreviewMessages(last);
                            }
                          } catch (err) {
                            console.error("Preview fetch failed", err);
                          }
                        }}
                        className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ease-(--grok-ease) w-full grok-hover pr-8
            ${
              isActive
                ? "bg-gray-200/40 dark:bg-neutral-700"
                : "hover:bg-gray-100 dark:hover:bg-neutral-800"
            }`}
                      >
                        <span className="truncate text-[14px] flex items-center gap-1 flex-1 min-w-0">
                          {conv.pinnedAt && (
                            <span className="text-gray-500 dark:text-gray-300 shrink-0">
                              <PinIcon size={12} />
                            </span>
                          )}
                          <span className="truncate">{conv.title || "New Chat"}</span>
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const rect = e.currentTarget.getBoundingClientRect();
                          buttonRects.current[conv._id] = rect;
                          setOpenHistoryMenuId((prev) =>
                            prev === conv._id ? null : conv._id,
                          );
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <circle cx="5" cy="12" r="1.5" />
                          <circle cx="12" cy="12" r="1.5" />
                          <circle cx="19" cy="12" r="1.5" />
                        </svg>
                      </button>
                      {openHistoryMenuId === conv._id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="fixed w-36 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-xl z-[99999] text-sm"
                          style={{
                            left: `${Math.min(
                              (buttonRects.current[conv._id]?.left ?? 200),
                              (typeof window !== "undefined" ? window.innerWidth : 1024) - 154,
                            )}px`,
                            top: `${buttonRects.current[conv._id]?.top || 0}px`,
                          }}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRenameConversation(conv._id);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800"
                          >
                            Rename
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePinConversation(conv._id);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800 flex items-center gap-2"
                          >
                            {conv.pinnedAt ? "Unpin" : "Pin"}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteConversation(conv._id);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
                <div className="ml-2 p-1">
                  <button
                    className="  text-[13px] cursor-pointer hover:text-neutral-700"
                    onClick={() => {
                      setIsSearchModalOpen(true);
                      setSearchQuery("");
                    }}
                  >
                    See all
                  </button>
                </div>
              </div>
            )}
          </div>
          <div
            className={`mt-auto pb-5 pr-3 relative transition-all duration-300 ease-out ${
              isOpen
                ? "flex flex-row items-center justify-between gap-3 ml-3"
                : "flex flex-col items-center justify-center gap-2 ml-7"
            }`}
          >
            {/* Profile avatar when logged in OR Log in trigger when logged out */}
            {!authChecked ? null : isLoggedIn ? (
              <div
                ref={profileMenuRef}
                className={`relative transition-all duration-300 flex items-center justify-center`}
                style={{ overflow: "visible" }}
              >
                <button
                  onClick={() => setIsProfileMenuOpen((v) => !v)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center overflow-hidden ${
                    userProfile?.avatar
                      ? "bg-transparent"
                      : "bg-gray-200 dark:bg-neutral-700"
                  }`}
                >
                  {userProfile?.avatar &&
                  userProfile.avatar.trim() !== "" ? (
                    <img
                      src={userProfile.avatar}
                      alt="User avatar"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-full block"
                      onLoad={() =>
                        console.log("Avatar loaded:", userProfile.avatar)
                      }
                      onError={(e) => {
                        console.log(
                          "Avatar failed to load:",
                          userProfile.avatar,
                        );
                        e.currentTarget.src = "/avatar.svg"; // fallback image
                      }}
                    />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  )}
                </button>

                {isProfileMenuOpen && (
                  <div
                    className={`absolute z-9999 w-44 bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-700 overflow-hidden transition-all duration-200 ease-(--grok-ease) grok-dropdown ${
                      isOpen
                        ? "bottom-full mb-2 left-0"
                        : "bottom-0 left-full ml-0"
                    } opacity-100 scale-100 max-h-[70vh]`}
                    style={{ transformOrigin: "bottom left" }}
                  >
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800 text-sm">
                      Settings
                    </button>
                    <Link 
                      href="/Pricing"
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800 text-sm block"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      Upgrade plan
                    </Link>
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800 text-sm">
                      Help
                    </button>
                    <div className="h-px bg-gray-200 dark:bg-neutral-700 my-1" />
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-600"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* When logged out: Login trigger in sidebar */
              isOpen ? (
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white bg-neutral-100 hover:bg-neutral-200/80 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-neutral-200/80 dark:border-neutral-700/80 transition-all cursor-pointer truncate"
                  title="Log in to PromptX"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0"
                  >
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  <span>Log in</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsLoginOpen(true)}
                  title="Log in to PromptX"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white bg-neutral-100 hover:bg-neutral-200/80 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-neutral-200/80 dark:border-neutral-700/80 transition-all cursor-pointer"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                </button>
              )
            )}

            {/* Sidebar toggle chevrons */}
            <div
              onClick={() => {
                if (isMobile) {
                  setIsMobileSidebarOpen(false);
                  return;
                }
                setIsOpen(!isOpen);
              }}
              className={`cursor-pointer  transition-all duration-500 ease-(--grok-ease) transform flex items-center justify-center w-9 h-9 hover:scale-[1.08] active:scale-[0.95] ${
                isOpen ? "order-2 ml-0" : "order-2 ml-0"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`lucide lucide-chevrons-right transition-transform duration-300 ease-(--grok-ease) ${
                  isOpen ? "rotate-180" : "rotate-0"
                }`}
              >
                <path d="m6 17 5-5-5-5" />
                <path d="m13 17 5-5-5-5" />
              </svg>
            </div>
          </div>
        </div>

        <div className="absolute top-3 left-4 z-50 flex items-center gap-2">
          {isMobile && !isMobileSidebarOpen && (
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-800 transition"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Auth controls: Top-right header pill with Log in & Sign up */}
        <div className="fixed sm:absolute top-3.5 right-4 z-40 flex items-center gap-2">
          {!authChecked || isLoggedIn ? null : (
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/85 dark:bg-neutral-900/85 backdrop-blur-md border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
              <button
                className="px-3 py-1.5 rounded-full text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
                onClick={() => {
                  if (!authChecked) return;
                  setIsLoginOpen(true);
                  setIsNavOpen(false);
                }}
              >
                Log in
              </button>
              <Link
                href="/Signup"
                className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition shadow-xs"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>

      <LoginModal
        open={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={async (dataUser) => {
          setIsLoggedIn(true);
          setUserProfile(dataUser);
          try {
            const res = await apiClient.get(`/conversations`);
            if (res.data?.success) {
              setConversations(res.data.data?.conversations || []);
            }
          } catch (e) {
            console.error("Failed to refresh conversations:", e);
          }
        }}
      />
      {isSearchModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-999"
            onClick={() => setIsSearchModalOpen(false)}
          />

          <div className="fixed inset-0 z-1000 flex items-center justify-center p-4 pointer-events-none">
            <div
              className="w-full max-w-5xl h-[80vh] bg-white dark:bg-neutral-900 rounded-2xl shadow-xl flex flex-col overflow-hidden min-h-0 pointer-events-auto animate-[grok-pop_0.25s_(--grok-ease)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sticky Search Bar */}
              <div className="px-4 py-2 border-b border-gray-200 flex justify-center items-center  dark:border-neutral-700 shrink-0 sticky top-0 bg-white dark:bg-neutral-900 z-10">
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full mb-0 px-3 py-2 rounded-lg  dark:bg-neutral-800 outline-none"
                />
                {/* Search icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width={20}
                  height={20}
                  className="shrink-0 flex items-center justify-center w-5 h-5"
                >
                  <g transform="translate(12 11.5)">
                    <path
                      stroke={theme === "light" ? "#000000" : "#ffffff"}
                      strokeWidth={2}
                      fill="none"
                      d="M7,-0.75 C7,1.39 6.132,3.328 4.73,4.73
           C3.328,6.132 1.39,7 -0.75,7
           C-5.03,7 -8.5,3.53 -8.5,-0.75
           C-8.5,-5.03 -5.03,-8.5 -0.75,-8.5
           C3.53,-8.5 7,-5.03 7,-0.75z
           M4.73,4.73 L8.5,8.5"
                    />
                  </g>
                </svg>
              </div>
              {/* Two-panel content */}
              <div className="flex flex-1 min-h-0 overflow-hidden">
                {/* Left panel */}
                <div
                  className="w-1/3 border-r border-gray-200 dark:border-neutral-700 p-4 overflow-y-auto hide-scrollbar min-h-0"
                  onWheel={(e) => e.stopPropagation()}
                  style={{
                    WebkitOverflowScrolling: "touch",
                    overscrollBehavior: "auto",
                  }}
                >
                  {conversations
                    .filter((c) => {
                      const q = searchQuery.toLowerCase();
                      if (!q) return true;
                      if (c.title?.toLowerCase().includes(q)) return true;
                      const cachedText = searchCache.current[c._id];
                      if (cachedText?.includes(q)) return true;
                      return false;
                    })
                    .map((conv) => (
                      <div
                        key={conv._id}
                        onMouseEnter={async () => {
                          if (!canFetchMessages) return;
                          if (!isLoggedIn && !guestId) return;

                          if (previewCache.current[conv._id]) {
                            setPreviewMessages(previewCache.current[conv._id]);
                            setPreviewConversationId(conv._id);
                            return;
                          }
                          try {
                            const res = await apiClient.get(
                              `/messages/${conv._id}`,
                              {
                                params: isLoggedIn ? undefined : { guestId },
                              },
                            );
                            if (res.data?.success) {
                              const msgs = res.data.data?.messages || [];
                              const allText = msgs
                                .map((m: { content: string }) =>
                                  m.content.toLowerCase(),
                                )
                                .join(" ");
                              searchCache.current[conv._id] = allText;
                              const last = msgs.slice(-8);
                              previewCache.current[conv._id] = last;
                              setPreviewMessages(last);
                              setPreviewConversationId(conv._id);
                            }
                          } catch (err) {
                            console.error("Preview fetch failed", err);
                          }
                        }}
                        onClick={async () => {
                          if (isMobile) setIsMobileSidebarOpen(false);
                          if (!canFetchMessages) return;
                          if (!isLoggedIn && !guestId) return;

                          setPreviewConversationId(conv._id);
                          if (previewCache.current[conv._id]) {
                            setPreviewMessages(previewCache.current[conv._id]);
                          } else {
                            try {
                              const res = await apiClient.get(
                                `/messages/${conv._id}`,
                                {
                                  params: isLoggedIn ? undefined : { guestId },
                                },
                              );
                              if (res.data?.success) {
                                const msgs = res.data.data?.messages || [];
                                const last = msgs.slice(-8);
                                previewCache.current[conv._id] = last;
                                setPreviewMessages(last);
                              }
                            } catch (err) {
                              console.error("Preview fetch failed", err);
                            }
                          }
                          setIsSearchModalOpen(false);
                          openConversation(conv._id);
                        }}
                        className={`px-3 py-2 rounded-lg cursor-pointer mb-1 transition-all duration-200 ease-(--grok-ease) grok-hover
                          ${
                            previewConversationId === conv._id
                              ? "bg-gray-200 dark:bg-neutral-700"
                              : "hover:bg-gray-100 dark:hover:bg-neutral-800"
                          }`}
                      >
                        <div className="flex flex-col">
                          <span className="truncate text-sm">
                            {conv.title || "New Chat"}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {new Date(conv.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Overlay for mobile sidebar */}
                {isMobile && isMobileSidebarOpen && (
                  <div
                    className="fixed inset-0 bg-black/40 z-40"
                    onClick={() => setIsMobileSidebarOpen(false)}
                  />
                )}
                {/* Right panel */}
                <div
                  className="flex-1 p-4 overflow-y-auto hide-scrollbar min-h-0"
                  onWheel={(e) => e.stopPropagation()}
                  style={{
                    WebkitOverflowScrolling: "touch",
                    overscrollBehavior: "auto",
                  }}
                >
                  {previewMessages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      Select a conversation to preview
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {previewMessages.map((m, i) => (
                        <div
                          key={i}
                          style={{ animationDelay: `${i * 30}ms` }}
                          className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap animate-[grok-bubble_0.25s_(--grok-ease)] ${
                            m.role === "user"
                              ? "self-end bg-black text-white"
                              : "self-start bg-gray-200 dark:bg-neutral-800 dark:text-white"
                          }`}
                        >
                          {m.content}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {/* Hide scrollbar globally for .hide-scrollbar */}
      {/* --- RENAME MODAL --- */}
      {isRenameOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[1000]"
            onClick={() => setIsRenameOpen(false)}
          />

          <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-5 animate-[grok-pop_0.25s_(--grok-ease)]"
            >
              <h3 className="text-sm font-medium mb-3">Rename chat</h3>

              <input
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") confirmRename();
                  if (e.key === "Escape") setIsRenameOpen(false);
                }}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-transparent outline-none mb-4"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsRenameOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>

                <button
                  onClick={confirmRename}
                  className="px-3 py-1.5 rounded-lg text-sm bg-black text-white dark:bg-white dark:text-black"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          width: 0px;
          height: 0px;
          display: none;
        }

        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
          overscroll-behavior: contain;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }

        :root {
          --grok-ease: cubic-bezier(0.22, 1, 0.36, 1);
        }

        @keyframes grok-fade-slide {
          from {
            opacity: 0;
            transform: translateY(6px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes grok-pop {
          from {
            transform: scale(0.96);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes grok-bubble {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .grok-hover {
          transition:
            transform 0.25s var(--grok-ease),
            box-shadow 0.25s var(--grok-ease);
        }

        .grok-hover:hover {
          transform: translateY(-1px);
        }

        .grok-hover:active {
          transform: scale(0.97);
        }

        .grok-dropdown {
          animation: grok-fade-slide 0.22s var(--grok-ease);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
          border-radius: 14px;
        }
      `}</style>
    </div>
  );
}

export default EnhacerHeader;
