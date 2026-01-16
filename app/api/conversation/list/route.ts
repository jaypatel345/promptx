import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/db/mongodb";
import { getDataFromToken } from "@/helper/getDataFromToken";
import Conversation from "@/model/Conversation";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const userId = getDataFromToken(request);
    const { searchParams } = new URL(request.url);
    const guestId = searchParams.get("guestId");

    // If neither user nor guest → unauthorized
    if (!userId && !guestId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    let filter: any = {};

    if (userId) {
      filter.userId = userId;
    } else if (guestId) {
      filter.guestId = guestId;
    }

    const conversations = await Conversation.find(filter)
      .select("_id title createdAt")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      conversations,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}