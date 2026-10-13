import { NextRequest, NextResponse } from "next/server";
import { getOrCreateConversation, listConversations } from "@/lib/chatStore";

export async function GET() {
  const conversations = listConversations();
  return NextResponse.json({
    success: true,
    data: {
      conversations,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const targetModel = body.targetModel || "chatgpt";
    const title = body.title || "New Prompt";

    const conv = getOrCreateConversation(undefined, targetModel, title);

    return NextResponse.json({
      success: true,
      data: {
        conversation: conv,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
