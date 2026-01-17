import { NextResponse } from "next/server";
import { connectDB } from "@/db/mongodb";
import Conversation from "@/model/Conversation";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { conversationId, guestId } = await req.json();

    if (!conversationId) {
      return NextResponse.json(
        { success: false, error: "Missing conversationId" },
        { status: 400 }
      );
    }

    const query: any = { _id: conversationId };

    // ----- AUTH LOGIC -----
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    let isAuthorized = false;

    if (token) {
      try {
        const decoded: any = jwt.verify(token, process.env.TOKEN_SECRET!);
        query.userId = decoded.id;
        isAuthorized = true;
      } catch (err) {
        // If token is invalid but guestId exists, fallback to guest
        if (guestId) {
          query.guestId = guestId;
          isAuthorized = true;
        } else {
          return NextResponse.json(
            { success: false, error: "Invalid session" },
            { status: 401 }
          );
        }
      }
    } else if (guestId) {
      query.guestId = guestId;
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const deleted = await Conversation.findOneAndDelete(query);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Conversation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}