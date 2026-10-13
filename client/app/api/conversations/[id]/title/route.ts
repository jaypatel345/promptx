import { NextRequest, NextResponse } from "next/server";
import { conversationStore } from "@/lib/chatStore";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const conv = conversationStore.get(id);

  if (!conv) {
    return NextResponse.json(
      { success: false, error: "Conversation not found" },
      { status: 404 }
    );
  }

  if (body.title) {
    conv.title = body.title;
    conv.updatedAt = new Date().toISOString();
  }

  return NextResponse.json({ success: true, data: { conversation: conv } });
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return PATCH(req, ctx);
}
