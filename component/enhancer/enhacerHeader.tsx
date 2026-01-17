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
// --- API helpers for conversation actions ---
async function apiRenameConversation(
  conversationId: string,
  title: string,
  guestId?: string
) {
  const res = await fetch("/api/conversation/rename", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ conversationId, title, guestId }),
  });
  if (!res.ok) throw new Error("Rename failed");
}

async function apiPinConversation(
  conversationId: string,
  pin: boolean,
  guestId?: string
) {
  const res = await fetch("/api/conversation/pin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ conversationId, pin, guestId }),
  });
  if (!res.ok) throw new Error("Pin failed");
}

async function apiDeleteConversation(conversationId: string, guestId?: string) {
  const payload: any = { conversationId };
  if (guestId) payload.guestId = guestId;

  const res = await fetch("/api/conversation/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data?.success) {
    throw new Error(data?.error || "Delete failed");
  }

  return data;
}
import { useTheme } from "@/context/theme-context";
import Image from "next/image";
import Link from "next/link";
import { useUi } from "@/context/UiContext";
import { usePathname } from "next/navigation";
import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { useChat } from "@/context/ChatContext";
import { Message } from "@/context/ChatContext";

function EnhacerHeader() {
  axios.defaults.withCredentials = true;
  // --- Auth/guest ready state for message fetches ---
  const [guestId, setGuestId] = useState<string | null>(null);
  const [guestReady, setGuestReady] = useState(false);
  const { theme, setTheme } = useTheme();
  const [search, setSearch] = React.useState<string>("");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewMessages, setPreviewMessages] = useState<Message[]>([]);
  const [previewConversationId, setPreviewConversationId] = useState<
    string | null
  >(null);
  const previewCache = useRef<Record<string, Message[]>>({});
  const searchCache = useRef<Record<string, string>>({});
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isHistoryHovered, setIsHistoryHovered] = useState(false);
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(false);
  const [openHistoryMenuId, setOpenHistoryMenuId] = useState<string | null>(
    null
  );
  // --- RENAME MODAL STATE ---
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [renameTargetId, setRenameTargetId] = useState<string | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

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
  const { isOpen, setIsOpen } = useUi();
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const { isNavOpen, setIsNavOpen, isLoginOpen, setIsLoginOpen } = useUi();
  const [user, setUser] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const { startNewChat } = useChat();
  const canFetchMessages = authChecked && (isLoggedIn || guestReady);

  const [conversations, setConversations] = useState<
    {
      _id: string;
      title: string;
      createdAt: string;
      pinnedAt?: string | null;
    }[]
  >([]);
  const sorted = React.useMemo(() => {
    return [...conversations].sort((a, b) => {
      if (a.pinnedAt && b.pinnedAt) {
        return new Date(b.pinnedAt).getTime() - new Date(a.pinnedAt).getTime();
      }
      if (a.pinnedAt) return -1;
      if (b.pinnedAt) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [conversations]);
  const latestConversations = React.useMemo(() => {
    return sorted.slice(0, 11);
  }, [sorted]);
  // --- HISTORY ACTION HANDLERS ---
  const handleRenameConversation = (id: string) => {
    const current = conversations.find((c) => c._id === id);
    setRenameTargetId(id);
    setRenameValue(current?.title || "");
    setIsRenameOpen(true);
  };

  const confirmRename = async () => {
    if (!renameTargetId || !renameValue.trim()) return;

    const prev = conversations;

    setConversations((prev) =>
      prev.map((c) =>
        c._id === renameTargetId ? { ...c, title: renameValue.trim() } : c
      )
    );

    try {
      const guestId = localStorage.getItem("guestId") || undefined;
      await apiRenameConversation(renameTargetId, renameValue.trim(), guestId);
    } catch (err) {
      console.error(err);
      setConversations(prev);
    }

    setIsRenameOpen(false);
    setRenameTargetId(null);
    setRenameValue("");
  };

  const handlePinConversation = async (id: string) => {
    const guestId = localStorage.getItem("guestId") || undefined;

    const prev = conversations;

    const target = conversations.find((c) => c._id === id);
    const wasPinned = !!target?.pinnedAt;

    const now = new Date().toISOString();

    setConversations((prev) =>
      prev.map((c) =>
        c._id === id ? { ...c, pinnedAt: wasPinned ? null : now } : c
      )
    );

    try {
      await apiPinConversation(id, !wasPinned, guestId);

      const res = await axios.get("/api/conversation/list", {
        withCredentials: true,
        params: isLoggedIn ? {} : { guestId },
      });

      if (res.data?.success) {
        setConversations(res.data.conversations);
      }
    } catch (err) {
      console.error(err);
      setConversations(prev);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    const localGuestId = !isLoggedIn
      ? localStorage.getItem("guestId") || undefined
      : undefined;

    const prev = conversations;

    // Optimistic UI update
    setConversations((prev) => prev.filter((c) => c._id !== id));

    if (conversationId === id) {
      setConversationId(null);
      setMessages([]);
    }

    try {
      // IMPORTANT: Do NOT send guestId when logged in
      await apiDeleteConversation(id, localGuestId);

      const res = await axios.get("/api/conversation/list", {
        withCredentials: true,
        params: isLoggedIn ? {} : { guestId: localGuestId },
      });

      if (res.data?.success) {
        setConversations(res.data.conversations);
      }
    } catch (err) {
      console.error(err);
      setConversations(prev); // rollback
    }
  };
  const { loadConversation, conversationId, setConversationId, setMessages } =
    useChat();
  const isGuest = !isLoggedIn;
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
  }, [latestConversations]);

  useEffect(() => {
    let id = localStorage.getItem("guestId");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("guestId", id);
    }
    setGuestId(id);
    setGuestReady(true);
  }, []);

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
        (c) => c._id === previewConversationId
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
              const res = await axios.get("/api/message/get", {
                withCredentials: true,
                params: isLoggedIn
                  ? { conversationId: next._id }
                  : { conversationId: next._id, guestId },
              });
              if (res.data?.success) {
                const last = res.data.messages.slice(-8);
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
              const res = await axios.get("/api/message/get", {
                withCredentials: true,
                params: isLoggedIn
                  ? { conversationId: prev._id }
                  : { conversationId: prev._id, guestId },
              });
              if (res.data?.success) {
                const last = res.data.messages.slice(-8);
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
  ]);

  // Prefetch message text for searching (background)
  useEffect(() => {
    const preloadSearchData = async () => {
      if (!canFetchMessages) return;
      for (const conv of conversations) {
        if (searchCache.current[conv._id]) continue;

        try {
          if (!canFetchMessages) return;
          const res = await axios.get("/api/message/get", {
            withCredentials: true,
            params: isLoggedIn
              ? { conversationId: conv._id }
              : { conversationId: conv._id, guestId },
          });

          if (res.data?.success) {
            const allText = res.data.messages
              .map((m: any) => m.content.toLowerCase())
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
  }, [isSearchModalOpen, conversations, canFetchMessages]);

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
      await axios.post("/api/logout", {}, { withCredentials: true });

      setIsLoggedIn(false);
      setConversations([]);
      setConversationId(null);
      setMessages([]);
      localStorage.removeItem("guestId");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  useEffect(() => {
    if (!isLoggedIn && !guestReady) return;

    const fetchHistory = async () => {
      try {
        const res = await axios.get("/api/conversation/list", {
          withCredentials: true,
          params: isLoggedIn ? {} : { guestId },
        });

        if (res.data?.success) {
          setConversations(res.data.conversations);
        }
      } catch (err) {
        console.error("Failed to load history", err);
      }
    };

    fetchHistory();
  }, [isLoggedIn, guestReady, guestId]);

  const openConversation = async (id: string) => {
    try {
      if (!canFetchMessages) return;
      const params = isLoggedIn
        ? { conversationId: id }
        : { conversationId: id, guestId };

      const res = await axios.get("/api/message/get", {
        withCredentials: true,
        params,
      });

      if (res.data?.success) {
        loadConversation(id, res.data.messages);
      }
    } catch (err) {
      console.error("Failed to open conversation", err);
    }
  };

  const createNewChat = async () => {
    startNewChat();

    try {
      const payload = isLoggedIn ? {} : { guestId };

      const res = await axios.post("/api/conversation/create", payload, {
        withCredentials: true,
      });

      if (res.data?.success) {
        setConversationId(res.data.conversationId);

        const historyRes = await axios.get("/api/conversation/list", {
          withCredentials: true,
          params: isLoggedIn ? {} : { guestId },
        });

        if (historyRes.data?.success) {
          setConversations(historyRes.data.conversations);
        }
      }
    } catch (err) {
      console.error("Failed to create conversation", err);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await axios.get("/api/me", { withCredentials: true });

        if (res.data?.success && !res.data.isGuest) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch {
        setIsLoggedIn(false);
      } finally {
        setAuthChecked(true);
      }
    };

    checkSession();
  }, []);

  const onLogin = async (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    if (loading) return;

    try {
      setLoading(true);

      const response = await axios.post(
        "/api/login",
        {
          email: user.email,
          password: user.password,
        },
        { withCredentials: true }
      );

      if (response.data?.success) {
        const me = await axios.get("/api/me", { withCredentials: true });
        if (me.data?.success) {
          setIsLoggedIn(true);
        }
        setLoginError("");
        setIsLoginOpen(false);
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Invalid email or password";

      setLoginError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <div className="flex justify-between ">
        <div
          className={`flex flex-col transition-all duration-300 ease-(--grok-ease) pr-5 h-screen min-h-0 border-r border-gray-200 dark:border-neutral-600 z-50 bg-white dark:bg-black ${
            isOpen ? "w-60 opacity-100" : "w-15 opacity-100"
          }`}
          style={{ overflow: "visible" }}
        >
          <div>
            <Link href="/" aria-label="Home" className="">
              <Image
                src={
                  theme === "light"
                    ? "/Rectangle.png"
                    : "/AdobeStock_450013573_Preview 1.png"
                }
                width={30}
                height={10}
                alt="promptx logo"
                className="ml-2 sm:ml-2.5 mt-4  w-9 h-4 md:h-7 "
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
          <div
            className={`mt-1 ml-2 flex flex-row items-center gap-1 pl-3 py-2.5 pr-5  rounded-2xl  transition-all duration-200 ease-(--grok-ease) hover:-translate-y dark:hover:bg-neutral-700/60 cursor-pointer
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
                <clipPath id="lottie_clip_371">
                  <rect width={24} height={24} x={0} y={0} />
                </clipPath>
              </defs>

              <g clipPath="url(#lottie_clip_371)">
                {/* Bottom rounded bar */}
                <g transform="translate(12 15.25)">
                  <path
                    d="M-8.5,-4.25 H8.5 V-2.15 C8.5,0.09 8.5,1.21 8.064,2.066 C7.681,2.819 7.069,3.431 6.316,3.814 C5.46,4.25 4.34,4.25 2.1,4.25 H-2.1 C-4.34,4.25 -5.46,4.25 -6.316,3.814 C-7.069,3.431 -7.681,2.819 -8.064,2.066 C-8.5,1.21 -8.5,0.09 -8.5,-2.15 Z"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="butt"
                    strokeLinejoin="miter"
                    fill="none"
                  />
                </g>

                {/* Top container */}
                <g transform="translate(12 8.25)">
                  <path
                    d="M8.5,3.75 V-1.75 H1 L-3,-3.75 H-8.5 V3.75"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="butt"
                    strokeLinejoin="miter"
                    fill="none"
                  />
                </g>
              </g>
            </svg>

            {isOpen && (
              <span className="ml-2 flex  flex-row font-medium text-[15px]   ">
                Project
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
          <div className="mt-0 ml-2 flex flex-col relative items-start gap-1 pl-2 py-2 pr-3 rounded-2xl transition-all duration-200 w-full flex-1 min-h-0 overflow-hidden">
            {isOpen && !isHistoryCollapsed && (
              <div
                className="absolute left-5 top-[5px] w-px bg-gray-200 dark:bg-neutral-700 transition-all duration-300"
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
                    : "opacity-100 translate-y-0 max-h-[500px]"
                }`}
                style={{
                  WebkitOverflowScrolling: "touch",
                  scrollBehavior: "smooth",
                  overscrollBehavior: "contain",
                }}
              >
                {latestConversations.length === 0 && (
                  <span className="text-gray-400 px-3 py-2">No chats yet</span>
                )}

                {sorted.slice(0, 11).map((conv, index) => {
                  const isActive = conversationId === conv._id;

                  return (
                    <div
                      ref={
                        index === 0
                          ? firstItemRef
                          : index === latestConversations.length - 1
                          ? lastItemRef
                          : null
                      }
                      key={conv._id}
                      className="relative group"
                    >
                      <div
                        onClick={async () => {
                          if (!canFetchMessages) return;

                          setIsSearchModalOpen(true);
                          setPreviewConversationId(conv._id);

                          if (previewCache.current[conv._id]) {
                            setPreviewMessages(previewCache.current[conv._id]);
                            return;
                          }

                          try {
                            const res = await axios.get("/api/message/get", {
                              withCredentials: true,
                              params: isLoggedIn
                                ? { conversationId: conv._id }
                                : { conversationId: conv._id, guestId },
                            });

                            if (res.data?.success) {
                              const last = res.data.messages.slice(-8);
                              previewCache.current[conv._id] = last;
                              setPreviewMessages(last);
                            }
                          } catch (err) {
                            console.error("Preview fetch failed", err);
                          }
                        }}
                        className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ease-(--grok-ease) truncate shrink-0 grok-hover pr-8
            ${
              isActive
                ? "bg-gray-200/40 dark:bg-neutral-700"
                : "hover:bg-gray-100 dark:hover:bg-neutral-800"
            }`}
                      >
                        <span className="truncate text-[14px] flex items-center gap-1">
                          {conv.pinnedAt && (
                            <span className="ml-1 text-gray-500 dark:text-gray-300">
                              <PinIcon size={12} />
                            </span>
                          )}
                          {conv.title || "New Chat"}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenHistoryMenuId((prev) =>
                            prev === conv._id ? null : conv._id
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
                          className="absolute right-2 top-full mt-1 w-32 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg z-50 overflow-hidden text-sm"
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
            {/* Profile avatar when logged in */}
            {!authChecked
              ? null
              : isLoggedIn && (
                  <div
                    ref={profileMenuRef}
                    className={`relative transition-all duration-300 flex items-center justify-center`}
                    style={{ overflow: "visible" }}
                  >
                    <button
                      onClick={() => setIsProfileMenuOpen((v) => !v)}
                      className="w-9 h-9 rounded-full bg-gray-200 dark:bg-neutral-700 flex items-center justify-center transition-all duration-500 ease-(--grok-ease) hover:scale-[1.04] active:scale-[0.96]"
                    >
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
                        <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800 text-sm">
                          Upgrade plan
                        </button>
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
                )}

            {/* Sidebar toggle chevrons */}
            <div
              onClick={() => setIsOpen(!isOpen)}
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

        <div className="absolute top-3 right-4 z-50">
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
            {/* <button ...settings button... /> */}
            {!authChecked || isLoggedIn ? null : (
              <button
                className="px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 bg-gray-300/40 text-black mr-1 sm:mr-2 md:mr-4 rounded-full hover:bg-gray-200 transition cursor-pointer text-[11px] sm:text-[12px] md:text-[13px] dark:bg-white dark:text-black dark:hover:bg-white/90"
                onClick={() => {
                  if (!authChecked) return;
                  setIsLoginOpen(true);
                  setIsNavOpen(false);
                }}
              >
                <span className="text-xs font-medium">Log in</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {isLoginOpen && (
        <>
          {/* BACKDROP – full screen */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 dark:bg-white/20"
            onClick={() => setIsLoginOpen(false)}
          ></div>

          {/* MODAL CONTAINER – centered */}
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none -translate-y-10 sm:-translate-y-20 transition-all duration-300 px-4 ">
            <div
              className="bg-white/70 w-lg max-w-xs sm:max-w-sm rounded-2xl px-10 sm:px-8 py-8 pointer-events-auto shadow-sm dark:bg-black/70 dark:text-white "
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-end mb-2">
                <button
                  type="button"
                  onClick={() => setIsLoginOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label="Close"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              {/*  FORM: Enter key will trigger submit */}
              <form onSubmit={onLogin}>
                <input
                  type="email"
                  placeholder="Email"
                  value={user.email}
                  onChange={(e) => {
                    setUser({ ...user, email: e.target.value });
                    setLoginError("");
                  }}
                  disabled={loading}
                  className="border-b border-gray-300 w-full px-2 py-2 mb-4 sm:mb-5 text-black outline-none dark:text-white text-sm sm:text-[15px] focus:border-gray-500 dark:focus:border-neutral-500"
                />

                <div className="flex items-center justify-center">
                  <input
                    type="password"
                    placeholder="Password"
                    value={user.password}
                    onChange={(e) => {
                      setUser({ ...user, password: e.target.value });
                      setLoginError("");
                    }}
                    disabled={loading}
                    className="border-b border-gray-300 w-full px-2 py-2 mb-9 text-black outline-none dark:text-white  sm:text-[15px] text-sm focus:border-gray-500 dark:focus:border-neutral-500"
                  />

                  <svg
                    width="16"
                    height="16"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="cursor-pointer ml-2 sm:ml-3 sm:w-[18px] sm:h-[18px] shrink-0 mb-3"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M8 2.5C3 2.5 0 8 0 8C0 8 3 13.5 8 13.5C13 13.5 16 8 16 8C16 8 13 2.5 8 2.5ZM10.4749 10.4749C9.8185 11.1313 8.92826 11.5 8 11.5C7.07174 11.5 6.1815 11.1313 5.52513 10.4749C4.86875 9.8185 4.5 8.92826 4.5 8C4.5 7.07174 4.86875 6.1815 5.52513 5.52513C6.1815 4.86875 7.07174 4.5 8 4.5C8.92826 4.5 9.8185 4.86875 10.4749 5.52513C11.1313 6.1815 11.5 7.07174 11.5 8C11.5 8.92826 11.1313 9.8185 10.4749 10.4749ZM9.76777 9.76777C10.2366 9.29893 10.5 8.66304 10.5 8C10.5 7.33696 10.2366 6.70107 9.76777 6.23223C9.29893 5.76339 8.66304 5.5 8 5.5C7.33696 5.5 6.70107 5.76339 6.23223 6.23223C5.76339 6.70107 5.5 7.33696 5.5 8C5.5 8.66304 5.76339 9.29893 6.23223 9.76777C6.70107 10.2366 7.33696 10.5 8 10.5C8.66304 10.5 9.29893 10.2366 9.76777 9.76777Z"
                    ></path>
                  </svg>
                </div>

                {loginError && (
                  <p className="text-red-500 text-xs mb-2 text-center">
                    {loginError}
                  </p>
                )}
                <button
                  type="submit"
                  className={`w-full bg-black text-[#aeaeaf] py-2 sm:py-2 md:py-3 rounded-full hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/90 text-sm sm:text-base flex items-center justify-center gap-2 ${
                    loading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
                  }`}
                  disabled={loading}
                  aria-busy={loading}
                >
                  {loading ? (
                    <>
                      <svg
                        className="h-4 w-4 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
                        />
                      </svg>
                      <span className="text-sm">Signing in...</span>
                    </>
                  ) : (
                    <span className="text-sm">SIGN IN</span>
                  )}
                </button>
              </form>

              {/* Google button (kept OUTSIDE form so it won't submit on click) */}
              <div className="flex justify-center items-center">
                <button
                  type="button"
                  className="w-fit sm:w-[60%] mt-2 text-white pr-3 sm:pr-3 rounded-full bg-black flex justify-between items-center hover:bg-black/80 cursor-pointer dark:bg-white dark:text-black dark:hover:bg-white/90 text-xs sm:text-sm"
                >
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className="bg-white p-1 sm:p-1 md:p-2 rounded-full text-black dark:bg-black"
                    width={32}
                    height={32}
                  >
                    <g>
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      ></path>
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      ></path>
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      ></path>
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      ></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </g>
                  </svg>

                  <div className="pl-2 md:-pl-5 text-sm">
                    Continue with Google
                  </div>
                </button>
              </div>

              <div className="flex justify-center items-center gap-1 sm:gap-2 pt-3 sm:pt-4 text-xs sm:text-[13px]">
                <Link
                  href="/forget-password"
                  className="text-black/60 dark:text-white"
                >
                  Forgot Password
                </Link>
                <Link href="/Signup" className="text-black dark:text-white">
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
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

                          if (previewCache.current[conv._id]) {
                            setPreviewMessages(previewCache.current[conv._id]);
                            setPreviewConversationId(conv._id);
                            return;
                          }
                          try {
                            const res = await axios.get("/api/message/get", {
                              withCredentials: true,
                              params: isLoggedIn
                                ? { conversationId: conv._id }
                                : { conversationId: conv._id, guestId },
                            });
                            if (res.data?.success) {
                              const allText = res.data.messages
                                .map((m: any) => m.content.toLowerCase())
                                .join(" ");
                              searchCache.current[conv._id] = allText;
                              const last = res.data.messages.slice(-8);
                              previewCache.current[conv._id] = last;
                              setPreviewMessages(last);
                              setPreviewConversationId(conv._id);
                            }
                          } catch (err) {
                            console.error("Preview fetch failed", err);
                          }
                        }}
                        onClick={async () => {
                          if (!canFetchMessages) return;

                          setPreviewConversationId(conv._id);
                          if (previewCache.current[conv._id]) {
                            setPreviewMessages(previewCache.current[conv._id]);
                          } else {
                            try {
                              const res = await axios.get("/api/message/get", {
                                withCredentials: true,
                                params: isLoggedIn
                                  ? { conversationId: conv._id }
                                  : { conversationId: conv._id, guestId },
                              });
                              if (res.data?.success) {
                                const last = res.data.messages.slice(-8);
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
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-999"
            onClick={() => setIsRenameOpen(false)}
          />

          <div className="fixed inset-0 z-1000 flex items-center justify-center p-4">
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
          transition: transform 0.25s var(--grok-ease),
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
