import { getDataFromToken } from "@/helper/getDataFromToken";
import { NextRequest, NextResponse } from "next/server";
import User from "@/model/userModel";
import { connectDB } from "@/db/mongodb";

export async function GET(request: NextRequest) {
  await connectDB();

  try {
    const userId = getDataFromToken(request); // may be null

    // If not logged in → Guest mode
    if (!userId) {
      return NextResponse.json({
        success: true,
        user: null,
        isGuest: true,
      });
    }

    const user = await User.findById(userId).select(
      "email username avatar provider googleId joined isVerified isAdmin"
    );

    // If token invalid or user not found → Guest
    if (!user) {
      return NextResponse.json({
        success: true,
        user: null,
        isGuest: true,
      });
    }

    // Logged-in user
    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        avatar: user.avatar || null,
        provider: user.provider || "credentials",
        joined: user.joined,
        isVerified: user.isVerified,
        isAdmin: user.isAdmin,
      },
      isGuest: false,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}