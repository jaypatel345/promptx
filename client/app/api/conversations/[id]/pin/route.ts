import { NextRequest, NextResponse } from "next/server";
import { conversationStore } from "@/lib/chatStore";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const conv = conversationStore.get(id);

  if (!conv) {
    return NextResponse.json(
      { success: false, error: "Conversation not found" },
      { status: 404 }
    );
  }

  conv.pinned = !conv.pinned;
  conv.pinnedAt = conv.pinned ? new Date().toISOString() : null;
  conv.updatedAt = new Date().toISOString();

  return NextResponse.json({
    success: true,
    data: {
      conversation: conv,
      pinnedAt: conv.pinnedAt,
    },
  });
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return PATCH(req, ctx);
}
