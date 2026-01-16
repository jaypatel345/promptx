import Conversation from "@/model/Conversation";
import { NextResponse } from "next/server";
import { connectDB } from "@/db/mongodb";
import { getDataFromToken } from "@/helper/getDataFromToken";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const body = await req.json();
    const { title, guestId } = body;

    const userId = getDataFromToken(req); // may be null for guests

    if (!userId && !guestId) {
      return NextResponse.json(
        { success: false, message: "Missing guestId or login token" },
        { status: 400 }
      );
    }

    const newConversation = await Conversation.create({
      title: title || "New Chat",
      userId: userId || null,
      guestId: userId ? null : guestId,
    });

    return NextResponse.json({
      success: true,
      conversationId: newConversation._id,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}