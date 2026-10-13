export interface StoredMessage {
  _id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface StoredConversation {
  _id: string;
  title: string;
  targetModel: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
  messages: StoredMessage[];
}

// Global in-memory storage during dev/runtime
declare global {
  // eslint-disable-next-line no-var
  var __PROMPTX_CONVERSATIONS__: Map<string, StoredConversation> | undefined;
}

if (!globalThis.__PROMPTX_CONVERSATIONS__) {
  globalThis.__PROMPTX_CONVERSATIONS__ = new Map<string, StoredConversation>();
}

export const conversationStore = globalThis.__PROMPTX_CONVERSATIONS__;

export function getOrCreateConversation(
  id?: string,
  targetModel = "chatgpt",
  initialTitle = "New Prompt"
): StoredConversation {
  if (id && conversationStore.has(id)) {
    return conversationStore.get(id)!;
  }

  const convId = id || `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const conv: StoredConversation = {
    _id: convId,
    title: initialTitle,
    targetModel,
    pinned: false,
    createdAt: now,
    updatedAt: now,
    messages: [],
  };

  conversationStore.set(convId, conv);
  return conv;
}

export function listConversations(): StoredConversation[] {
  return Array.from(conversationStore.values()).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}
