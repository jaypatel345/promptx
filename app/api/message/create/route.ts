import { connectDB } from "@/db/mongodb";
import Message from "@/model/message";
import { NextResponse } from "next/server";

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

    const newMessage = await Message.create({
      conversationId,
      role,
      content,
      attachments: attachments || [],
    });

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
