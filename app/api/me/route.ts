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

    const user = await User.findById(userId).select("-password");

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
      user,
      isGuest: false,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}