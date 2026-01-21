import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/db/mongodb";
import Message from "@/model/message";
import Conversation from "@/model/Conversation";
import { getDataFromToken } from "@/helper/getDataFromToken";

export async function GET(req: NextRequest) {
  await connectDB();

  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");
    const guestId = searchParams.get("guestId");

    if (!conversationId) {
      return NextResponse.json(
        { success: false, message: "conversationId is required" },
        { status: 400 }
      );
    }

    const userId = getDataFromToken(req); // may be null

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return NextResponse.json(
        { success: false, message: "Conversation not found" },
        { status: 404 }
      );
    }

    // 🔐 Ownership validation
    const isUserOwner = userId && conversation.userId?.toString() === userId;

    const isGuestOwner = guestId && conversation.guestId === guestId;

    // Allow access if:
    // - Logged-in user owns the conversation
    // - Guest owns the conversation
    // - OR both userId and guestId are missing (public/first-load safe mode)

    const isPublicAccess = !userId && !guestId;

    if (!isUserOwner && !isGuestOwner && !isPublicAccess) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const messages = await Message.find({ conversationId }).sort({
      createdAt: 1,
    });

    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
