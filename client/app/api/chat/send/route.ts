import { NextRequest, NextResponse } from "next/server";
import { getOrCreateConversation } from "@/lib/chatStore";
import { enhancePromptWithGroq } from "@/lib/promptService";

export async function POST(req: NextRequest) {
  try {
    let content = "";
    let conversationId = "";
    let targetModel = "chatgpt";

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      content = (formData.get("content") as string) || "";
      conversationId = (formData.get("conversationId") as string) || "";
      targetModel = (formData.get("targetModel") as string) || "chatgpt";
    } else {
      const body = await req.json().catch(() => ({}));
      content = body.content || "";
      conversationId = body.conversationId || "";
      targetModel = body.targetModel || "chatgpt";
    }

    if (!content.trim()) {
      return NextResponse.json(
        { success: false, error: "Content is required" },
        { status: 400 }
      );
    }

    // Auto-generate title from first 6 words
    const autoTitle =
      content.trim().slice(0, 40).replace(/[\r\n]+/g, " ") +
      (content.length > 40 ? "..." : "");

    const conv = getOrCreateConversation(
      conversationId || undefined,
      targetModel,
      autoTitle
    );

    // Record user message
    const userMsg = {
      _id: `msg_u_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      role: "user" as const,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };
    conv.messages.push(userMsg);
    conv.targetModel = targetModel;
    conv.updatedAt = new Date().toISOString();

    // Directly enhance prompt via Groq
    const enhancedPrompt = await enhancePromptWithGroq({
      content,
      targetModel,
      conversationHistory: conv.messages.slice(0, -1),
    });

    // Record assistant message
    const assistantMsg = {
      _id: `msg_a_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      role: "assistant" as const,
      content: enhancedPrompt,
      createdAt: new Date().toISOString(),
    };
    conv.messages.push(assistantMsg);
    conv.updatedAt = new Date().toISOString();

    return NextResponse.json({
      success: true,
      data: {
        conversationId: conv._id,
        aiJobId: null, // Complete immediately, no background queue delay!
        enhancedPrompt,
        message: assistantMsg,
        messages: conv.messages,
      },
    });
  } catch (error: any) {
    console.error("Chat send error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process chat message",
      },
      { status: 500 }
    );
  }
}
