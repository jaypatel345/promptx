import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/db/mongodb";
import Message from "@/model/message";

export async function GET(req: NextRequest) {
  await connectDB();

  try {
    const conversationId = req.nextUrl.searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json(
        { success: false, message: "conversationId is required" },
        { status: 400 }
      );
    }

    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

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