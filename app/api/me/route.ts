import { getDataFromToken } from "@/helper/getDataFromToken";
import { NextRequest, NextResponse } from "next/server";
import User from "@/model/userModel";
import { connectDB } from "@/db/mongodb";

export async function GET(request: NextRequest) {
  await connectDB();

  const userId = getDataFromToken(request);

  if (!userId) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const user = await User.findById(userId).select("-password");

  if (!user) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    user,
  });
}