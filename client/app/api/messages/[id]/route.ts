import { NextRequest, NextResponse } from "next/server";
import { conversationStore } from "@/lib/chatStore";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const conv = conversationStore.get(id);

  if (!conv) {
    return NextResponse.json({
      success: true,
      data: {
        messages: [],
      },
    });
  }

  return NextResponse.json({
    success: true,
    data: {
      messages: conv.messages,
      conversation: {
        _id: conv._id,
        title: conv.title,
        targetModel: conv.targetModel,
        pinned: conv.pinned,
      },
    },
  });
}
