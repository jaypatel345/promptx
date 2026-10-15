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
  pinnedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  messages: StoredMessage[];
  guestId?: string;
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
  initialTitle = "New Prompt",
  guestId?: string
): StoredConversation {
  if (id && conversationStore.has(id)) {
    const existing = conversationStore.get(id)!;
    if (guestId && !existing.guestId) {
      existing.guestId = guestId;
    }
    return existing;
  }

  const convId = id || `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const conv: StoredConversation = {
    _id: convId,
    title: initialTitle,
    targetModel,
    pinned: false,
    pinnedAt: null,
    createdAt: now,
    updatedAt: now,
    messages: [],
    guestId,
  };

  conversationStore.set(convId, conv);
  return conv;
}

export function listConversations(guestId?: string): StoredConversation[] {
  const all = Array.from(conversationStore.values());
  const filtered = guestId
    ? all.filter((c) => !c.guestId || c.guestId === guestId)
    : all;
  return filtered.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}
