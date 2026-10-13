import { NextRequest, NextResponse } from "next/server";
import { conversationStore } from "@/lib/chatStore";

export async function GET(
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
  return NextResponse.json({ success: true, data: { conversation: conv } });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  conversationStore.delete(id);
  return NextResponse.json({ success: true, message: "Deleted" });
}
