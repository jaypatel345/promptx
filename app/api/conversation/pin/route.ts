import { NextResponse } from "next/server";
import { connectDB } from "@/db/mongodb";
import Conversation from "@/model/Conversation";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { conversationId, pin, guestId } = await req.json();

    if (!conversationId) {
      return NextResponse.json(
        { success: false, error: "Missing conversationId" },
        { status: 400 }
      );
    }

    if (typeof pin !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Invalid pin value" },
        { status: 400 }
      );
    }

    const query: any = { _id: conversationId };

    // --- AUTH LOGIC ---
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    console.log("PIN API auth check:", {
      hasToken: !!token,
      guestId,
    });

    if (token) {
      try {
        const decoded: any = jwt.verify(token, process.env.TOKEN_SECRET!);
        query.userId = decoded.id;
      } catch (err) {
        return NextResponse.json(
          { success: false, error: "Invalid session" },
          { status: 401 }
        );
      }
    } else if (guestId) {
      query.guestId = guestId;
    } else {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const convo = await Conversation.findOne(query);

    if (!convo) {
      return NextResponse.json(
        { success: false, error: "Conversation not found" },
        { status: 404 }
      );
    }

    convo.pinnedAt = pin ? new Date() : null;
    await convo.save({ validateBeforeSave: false });

    return NextResponse.json({
      success: true,
      conversation: {
        _id: convo._id,
        pinnedAt: convo.pinnedAt,
      },
    });
  } catch (err) {
    console.error("Pin error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
