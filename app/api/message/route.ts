import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/db/mongodb";
import Message from "@/model/message";
import Conversation from "@/model/Conversation";
import { getDataFromToken } from "@/helper/getDataFromToken";

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const body = await req.json();
    const { conversationId, role, content, guestId } = body;

    if (!conversationId || !role || !content) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
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

    // Ownership check
    if (
      (userId && conversation.userId?.toString() !== userId) ||
      (!userId && conversation.guestId !== guestId)
    ) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const newMessage = await Message.create({
      conversationId,
      role,
      content,
    });

    return NextResponse.json({
      success: true,
      message: newMessage,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}