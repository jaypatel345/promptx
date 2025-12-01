import { NextRequest, NextResponse } from "next/server";
import User from "@/model/userModel";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/db/mongodb";

connectDB();

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid password" }, { status: 400 });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.TOKEN_SECRET!,
      { expiresIn: "1d" }
    );

    return NextResponse.json({
      message: "Login successful",
      token,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}