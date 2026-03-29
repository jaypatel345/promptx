import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { sendEmail } from "../utils/mailer.js";
import asyncHandler from "../utils/asyncHandler.js";
import  ApiError  from "../utils/ApiError.js";
import { sendResponse } from "../utils/sendResponse.js";
import { generateToken } from "../utils/generateToken.js";

// SIGNUP
export const signupUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    throw new ApiError(400, "Username, email, and password are required");
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(400, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const savedUser = await User.create({
    username,
    email,
    password: hashedPassword,
    isVerified: false,
    isAdmin: false,
    joined: new Date(),
  });

  await sendEmail({
    email,
    emailType: "VERIFY",
    userId: savedUser._id,
  });

  return sendResponse(res, "User created successfully", 201, {
    user: {
      _id: savedUser._id.toString(),
      username: savedUser.username,
      email: savedUser.email,
      joined: savedUser.joined,
    },
  });
});

// LOGIN
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Block password login for Google users
  if (user.provider === "google") {
    throw new ApiError(
      403,
      "This account uses Google Sign-In. Please continue with Google.",
    );
  }

  if (!user.password) {
    throw new ApiError(401, "Invalid login method");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = generateToken(user._id);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 1000 * 60 * 60 * 24,
  });

  return sendResponse(res, "Login successful", 200, {
    userId: user._id,
    username: user.username,
  });
});

export const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return sendResponse(res, "Logged out successfully", 200);
};

export const googleCallback = async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.redirect(`${process.env.CLIENT_URL}/login?error=missing_code`);
  }

  try {
    // Exchange code for token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.SERVER_URL}/api/auth/callback`,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      throw new Error("Failed to get access token");
    }

    // Fetch Google profile
    const profileRes = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      },
    );

    const profile = await profileRes.json();

    const { email, name, picture, id: googleId } = profile;

    if (!email) throw new Error("No email from Google");

    //  Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      const username =
        name?.replace(/\s+/g, "").toLowerCase() || email.split("@")[0];

      user = await User.create({
        email,
        username,
        avatar: picture,
        provider: "google",
        googleId,
        isVerified: true,
      });
    } else {
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

    // Create JWT
    const token = generateToken(user._id);

    //  Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 1000 * 60 * 60 * 24,
    });

    // Redirect to frontend
    return res.redirect(`${process.env.CLIENT_URL}/Enhancer`);
  } catch (error) {
    console.error("Google login error:", error);

    return res.redirect(`${process.env.CLIENT_URL}/login?error=google_failed`);
  }
};

export const googleLogin = (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.SERVER_URL}/api/auth/callback`;

  const scope = encodeURIComponent("openid email profile");

  const googleAuthUrl =
    `https://accounts.google.com/o/oauth2/v2/auth` +
    `?client_id=${clientId}` +
    `&redirect_uri=${redirectUri}` +
    `&response_type=code` +
    `&scope=${scope}` +
    `&prompt=select_account`;

  return res.redirect(googleAuthUrl);
};

export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new ApiError(400, "Token is required");
  }

  const user = await User.findOne({
    verifyToken: token,
    verifyTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired token");
  }

  user.isVerified = true;
  user.verifyToken = undefined;
  user.verifyTokenExpiry = undefined;

  await user.save();

  return sendResponse(res, "Email verified successfully", 200);
});
