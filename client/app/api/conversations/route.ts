import { NextRequest, NextResponse } from "next/server";
import { getOrCreateConversation, listConversations } from "@/lib/chatStore";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const guestId = searchParams.get("guestId") || undefined;
  const rawList = listConversations(guestId);

  const conversations = rawList.map((c) => ({
    _id: c._id,
    title: c.title,
    targetModel: c.targetModel,
    pinned: c.pinned,
    pinnedAt: c.pinned ? (c.pinnedAt || c.updatedAt) : null,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }));

  return NextResponse.json({
    success: true,
    data: {
      conversations,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const body = await req.json().catch(() => ({}));
    const targetModel = body.targetModel || "chatgpt";
    const title = body.title || "New Prompt";
    const guestId = body.guestId || searchParams.get("guestId") || undefined;

    const conv = getOrCreateConversation(undefined, targetModel, title, guestId);

    return NextResponse.json({
      success: true,
      data: {
        conversationId: conv._id,
        conversation: {
          ...conv,
          pinnedAt: conv.pinned ? (conv.pinnedAt || conv.updatedAt) : null,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
