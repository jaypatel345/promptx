"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

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
}

interface ChatContextType {
  conversationId: string | null;
  messages: Message[];
  conversations: ConversationMeta[];
  loadingHistory: boolean;
  guestId: string | null;

  setConversationId: React.Dispatch<React.SetStateAction<string | null>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;

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

  // Load from localStorage on boot
  useEffect(() => {
    const savedConversationId = localStorage.getItem("conversationId");
    const savedMessages = localStorage.getItem("messages");
    let gid = localStorage.getItem("guestId");

    if (!gid) {
      gid = crypto.randomUUID();
      localStorage.setItem("guestId", gid);
    }

    setGuestId(gid);

    if (savedConversationId) setConversationIdState(savedConversationId);
    if (savedMessages) setMessagesState(JSON.parse(savedMessages));
  }, []);

  // Persist conversationId
  useEffect(() => {
    if (conversationId)
      localStorage.setItem("conversationId", conversationId);
    else localStorage.removeItem("conversationId");
  }, [conversationId]);

  // Persist messages
  useEffect(() => {
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

  const refreshHistory = async () => {
  try {
    setLoadingHistory(true);

    const gid = localStorage.getItem("guestId");

    const url = gid
      ? `/api/conversation/list?guestId=${gid}`
      : "/api/conversation/list";

    const res = await fetch(url, {
      credentials: "include",
    });

    const data = await res.json();

    if (data.success) {
      setConversations(data.conversations);
    }
  } catch (err) {
    console.error("Failed to load history", err);
  } finally {
    setLoadingHistory(false);
  }
};

  useEffect(() => {
    refreshHistory();
  }, []);

  return (
    <ChatContext.Provider
      value={{
        conversationId,
        messages,
        conversations,
        loadingHistory,
        guestId,
        setConversationId: setConversationIdState,
        setMessages: setMessagesState,
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