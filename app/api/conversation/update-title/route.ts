import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/db/mongodb";
import Conversation from "@/model/Conversation";
import { getDataFromToken } from "@/helper/getDataFromToken";

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const { conversationId, title, guestId } = await req.json();
    const userId = getDataFromToken(req);

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return NextResponse.json({ success: false }, { status: 404 });
    }

    if (
      (userId && conversation.userId?.toString() !== userId) ||
      (!userId && conversation.guestId !== guestId)
    ) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    conversation.title = title;
    await conversation.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}