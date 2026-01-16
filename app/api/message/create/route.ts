import { connectDB } from "@/db/mongodb";
import Message from "@/model/message";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Conversation from "@/model/Conversation";
export async function POST(req: Request) {
  await connectDB();

  try {
    const body = await req.json();
    const { conversationId, role, content, attachments } = body;

    if (!conversationId || !role || !content) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    //  Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return NextResponse.json(
        { success: false, message: "Invalid conversationId" },
        { status: 400 }
      );
    }

    const newMessage = await Message.create({
      conversationId,
      role,
      content,
      attachments: attachments || [],
    });
    // Auto update title if first user message
    if (role === "user") {
      const conversation = await Conversation.findById(conversationId);

      if (
        conversation &&
        (!conversation.title || conversation.title === "New Chat")
      ) {
        const shortTitle = content.split(" ").slice(0, 6).join(" ");
        conversation.title = shortTitle;
        await conversation.save();
      }
    }

    return NextResponse.json({
      success: true,
      message: newMessage,
    });
  } catch (error) {
    console.error("Save message error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to save message",
      },
      { status: 500 }
    );
  }
}
