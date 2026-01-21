import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/db/mongodb";
import User from "@/model/userModel";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/login?error=missing_code`
    );
  }

  try {
    // 1️⃣ Exchange code for token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      console.error("Token exchange failed:", tokenData);
      throw new Error("Failed to get access token");
    }

    // 2️⃣ Fetch Google profile
    const profileRes = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    const profile = await profileRes.json();

    const { email, name, picture, id: googleId } = profile;

    if (!email) throw new Error("No email from Google");

    await connectDB();

    // 3️⃣ Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      const username =
        name?.replace(/\s+/g, "").toLowerCase() ||
        email.split("@")[0];

      user = await User.create({
        email,
        username,
        avatar: picture,
        provider: "google",
        googleId,
        isVerified: true,
      });
    } else {
      // 🔄 Update avatar & googleId if missing
      let changed = false;

      if (!user.googleId) {
        user.googleId = googleId;
        changed = true;
      }

      if (!user.avatar && picture) {
        user.avatar = picture;
        changed = true;
      }

      if (changed) await user.save();
    }

    // 4️⃣ Create JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.TOKEN_SECRET!,
      { expiresIn: "7d" }
    );

    // 5️⃣ Set cookie
    const res = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/Enhancer`
    );

    res.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res;
  } catch (err) {
    console.error("Google login error:", err);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/login?error=google_failed`
    );
  }
}