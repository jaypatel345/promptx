"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { API_BASE } from "@/lib/apiBase";
import { apiClient } from "@/lib/apiClient";
import { DEFAULT_TARGET_MODEL } from "@/lib/models";

export interface Message {
  _id?: string;
  role: "user" | "assistant";
  content: string;
  attachments?: {
    id: string;
    file: File;
    objectUrl: string;
    kind: "image" | "file";
  }[];
  createdAt?: string;
}

export interface ConversationMeta {
  _id: string;
  title: string;
  createdAt: string;
  pinnedAt?: string | null;
}

interface ChatContextType {
  conversationId: string | null;
  messages: Message[];
  conversations: ConversationMeta[];
  loadingHistory: boolean;
  guestId: string | null;
  // Which LLM the user plans to paste the enhanced prompt into (ChatGPT,
  // Claude, Gemini, ...) — not the engine used to generate the enhancement.
  targetModel: string;

  setConversationId: React.Dispatch<React.SetStateAction<string | null>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setConversations: React.Dispatch<React.SetStateAction<ConversationMeta[]>>;
  setTargetModel: (targetModel: string) => void;

  startNewChat: () => void;
  loadConversation: (id: string, msgs: Message[]) => void;
  refreshHistory: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatContextProvider({ children }: { children: React.ReactNode }) {
  const [conversationId, setConversationIdState] = useState<string | null>(null);
  const [messages, setMessagesState] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<ConversationMeta[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [targetModel, setTargetModelState] = useState<string>(DEFAULT_TARGET_MODEL);
  const isHydratedRef = React.useRef(false);

  const refreshHistory = React.useCallback(async () => {
    try {
      setLoadingHistory(true);
      const gid =
        guestId ||
        (typeof window !== "undefined"
          ? localStorage.getItem("guestId")
          : null);
      const res = await apiClient.get("/conversations", {
        params: gid ? { guestId: gid } : undefined,
      });
      if (res.data?.success) {
        const convs = res.data.data?.conversations || [];
        setConversations(convs);
      }
    } catch (err) {
      console.warn("Failed to refresh conversation history", err);
    } finally {
      setLoadingHistory(false);
    }
  }, [guestId]);

  // Load from localStorage on boot
  useEffect(() => {
    let gid = localStorage.getItem("guestId");
    if (!gid) {
      gid = crypto.randomUUID();
      localStorage.setItem("guestId", gid);
    }
    setGuestId(gid);

    const savedConversationId = localStorage.getItem("conversationId");
    const savedMessages = localStorage.getItem("messages");

    if (savedConversationId) setConversationIdState(savedConversationId);
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        if (Array.isArray(parsed)) {
          setMessagesState(parsed);
        }
      } catch (err) {
        console.warn("Corrupt saved messages reset", err);
        localStorage.removeItem("messages");
      }
    }

    const savedTargetModel = localStorage.getItem("targetModel");
    if (savedTargetModel) setTargetModelState(savedTargetModel);

    isHydratedRef.current = true;

    // Immediately fetch conversation history in background
    apiClient
      .get("/conversations", {
        params: gid ? { guestId: gid } : undefined,
      })
      .then((res) => {
        if (res.data?.success) {
          setConversations(res.data.data?.conversations || []);
        }
      })
      .catch((err) => {
        console.warn("Initial history fetch deferred", err);
      });
  }, []);

  const setTargetModel = (next: string) => {
    setTargetModelState(next);
    localStorage.setItem("targetModel", next);
  };

  // Persist conversationId ONLY after initial mount hydration
  useEffect(() => {
    if (!isHydratedRef.current) return;
    if (conversationId) {
      localStorage.setItem("conversationId", conversationId);
    } else {
      localStorage.removeItem("conversationId");
    }
  }, [conversationId]);

  // Persist messages ONLY after initial mount hydration
  useEffect(() => {
    if (!isHydratedRef.current) return;
    localStorage.setItem("messages", JSON.stringify(messages));
  }, [messages]);

  const startNewChat = () => {
    setConversationIdState(null);
    setMessagesState([]);
    localStorage.removeItem("conversationId");
    localStorage.removeItem("messages");
  };

  // Used when clicking history item
  const loadConversation = (id: string, msgs: Message[]) => {
    setConversationIdState(id);
    setMessagesState(msgs);
    localStorage.setItem("conversationId", id);
    localStorage.setItem("messages", JSON.stringify(msgs));
  };

  return (
    <ChatContext.Provider
      value={{
        conversationId,
        messages,
        conversations,
        loadingHistory,
        guestId,
        targetModel,
        setConversationId: setConversationIdState,
        setMessages: setMessagesState,
        setConversations,
        setTargetModel,
        startNewChat,
        loadConversation,
        refreshHistory,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatContextProvider");
  return ctx;
}
