import Conversation from "@/model/Conversation";
import { NextResponse } from "next/server";
import { connectDB } from "@/db/mongodb";
import { getDataFromToken } from "@/helper/getDataFromToken";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const userId = getDataFromToken(req);
    const body = await req.json();
    const { title } = body;

    const newConversation = await Conversation.create({
      userId,
      title: title || "New Chat",
    });

    return NextResponse.json({
      success: true,
      conversationId: newConversation._id,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 401 }
    );
  }
}