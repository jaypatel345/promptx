import { sendEmail } from "../utils/mailer.js";
import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import {
  findByEmail,
  createUser,
  findByEmailSelectPassword,
  saveUser,
  createGoogleUser,
  verifyUserById,
} from "../repositories/user.repository.js";
import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";
import {
  findRefreshToken,
  storeRefreshToken,
  findValidVerifyToken,
  deleteTokenById,
} from "../repositories/token.repository.js";

const register = async (data) => {
  const { username, email, password } = data;

  if (!username || !email || !password) {
    throw new ApiError(400, "Username, email, and password are required");
  }

  const existingUser = await findByEmail(email);

  if (existingUser) {
    throw new ApiError(400, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const savedUser = await createUser({
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

  return {
    _id: savedUser._id.toString(),
    username: savedUser.username,
    email: savedUser.email,
    joined: savedUser.joined,
  };
};

const login = async (data) => {
  const { email, password } = data;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await findByEmailSelectPassword(email);

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
  const AccessToken = generateAccessToken(user._id);
  const RefreshToken = generateRefreshToken(user._id);

  await storeRefreshToken(RefreshToken, user._id);

  return {
    user: {
      userId: user._id,
      username: user.username,
    },
    AccessToken,
    RefreshToken,
  };
};

const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  let decoded;

  try {
    decoded = jwt.verify(refreshToken, process.env.REFRESHTOKEN_SECRET);
    console.log(decoded.id);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const tokenInDb = await findRefreshToken(refreshToken);

  if (!tokenInDb) {
    throw new ApiError(401, "Refresh token not found");
  }

  const newAccessToken = generateAccessToken(decoded.id);

  return newAccessToken;
};

const googleLogin = async (code) => {
  if (!code) {
    throw new ApiError(400, "Missing Google code");
  }

  // Exchange code for Google token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.SERVER_URL}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenRes.json();

  if (!tokenData.access_token) {
    throw new ApiError(401, "Failed to get Google access token");
  }

  // Fetch profile
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

  if (!email) {
    throw new ApiError(400, "No email from Google");
  }

  let user = await findByEmail(email);

  if (!user) {
    const username =
      name?.replace(/\s+/g, "").toLowerCase() || email.split("@")[0];

    user = await createGoogleUser({
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

    if (changed) {
      await saveUser(user);
    }
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  await storeRefreshToken(refreshToken, user._id);

  return {
    accessToken,
    refreshToken,
    user,
  };
};

const getGoogleAuthUrl = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.SERVER_URL}/api/auth/google/callback`;

  const scope = encodeURIComponent("openid email profile");

  return (
    `https://accounts.google.com/o/oauth2/v2/auth` +
    `?client_id=${clientId}` +
    `&redirect_uri=${redirectUri}` +
    `&response_type=code` +
    `&scope=${scope}` +
    `&prompt=select_account`
  );
};

const verifyUserEmail = async (token) => {
  if (!token) {
    throw new ApiError(400, "Token is required");
  }

  const tokenDoc = await findValidVerifyToken(token);

  if (!tokenDoc) {
    throw new ApiError(400, "Invalid or expired token");
  }

  await verifyUserById(tokenDoc.userId);

  await deleteTokenById(tokenDoc._id);

  return true;
};

export {
  register,
  login,
  refreshAccessToken,
  googleLogin,
  getGoogleAuthUrl,
  verifyUserEmail,
};
