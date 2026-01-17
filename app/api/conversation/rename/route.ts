import { NextResponse } from "next/server";
import { connectDB } from "@/db/mongodb";
import Conversation from "@/model/Conversation";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { conversationId, title, guestId } = await req.json();

    if (!conversationId || !title) {
      return NextResponse.json(
        { success: false, error: "Missing fields" },
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
        // fallback to guest if token invalid but guestId exists
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

    const convo = await Conversation.findOne(query);

    if (!convo) {
      return NextResponse.json(
        { success: false, error: "Conversation not found" },
        { status: 404 }
      );
    }

    convo.title = title;
    await convo.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Rename error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}