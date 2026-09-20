"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { API_BASE } from "@/lib/apiBase";
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

  // Load from localStorage on boot
  useEffect(() => {
    const savedConversationId = localStorage.getItem("conversationId");
    const savedMessages = localStorage.getItem("messages");
    let gid = localStorage.getItem("guestId");

    console.log("ChatContext loading guestId from localStorage:", gid);

    if (!gid) {
      gid = crypto.randomUUID();
      localStorage.setItem("guestId", gid);
      console.log("Generated new guestId:", gid);
    }

    console.log("Setting guestId in ChatContext:", gid);
    setGuestId(gid);

    if (savedConversationId) setConversationIdState(savedConversationId);
    if (savedMessages) setMessagesState(JSON.parse(savedMessages));

    const savedTargetModel = localStorage.getItem("targetModel");
    if (savedTargetModel) setTargetModelState(savedTargetModel);
  }, []);

  const setTargetModel = (next: string) => {
    setTargetModelState(next);
    localStorage.setItem("targetModel", next);
  };

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
    // No-op - let enhancerHeader handle conversation loading
    console.log("refreshHistory called - conversations handled by enhancerHeader");
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
