import asyncHandler from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/sendResponse.js";
import {
  login,
  refreshAccessToken,
  register,
  googleLogin,
  getGoogleAuthUrl,
  verifyUserEmail,
} from "../services/user.service.js";
import { cookie15Min, cookie7Days } from "../utils/cookieOptions.js";

// SIGNUP
export const signupUser = asyncHandler(async (req, res) => {
  const user = await register(req.body,req.requestId);

  // console.log(req.requestId);
  return sendResponse(res, "User created successfully", 201, {
    user,
  });
});

// LOGIN
export const loginUser = asyncHandler(async (req, res) => {
  const user = await login(req.body);

  res.cookie("accessToken", user.AccessToken, cookie15Min);
  res.cookie("refreshToken", user.RefreshToken, cookie7Days);

  return sendResponse(res, "Login successful", 200, {
    user: user,
  });
});
// LOGOUT
export const logoutUser = (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return sendResponse(res, "Logged out successfully", 200);
};

// GOOGLE SIGNUP
export const googleCallback = async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.redirect(`${process.env.CLIENT_URL}/login?error=missing_code`);
  }

  try {
    const result = await googleLogin(code);

    res.cookie("accessToken", result.accessToken, cookie15Min);

    res.cookie("refreshToken", result.refreshToken, cookie7Days);

    return res.redirect(`${process.env.CLIENT_URL}/Enhancer`);
  } catch (error) {
    console.error("Google login error:", error);

    return res.redirect(`${process.env.CLIENT_URL}/login?error=google_failed`);
  }
};
// GOOGLE LOGIN
export const googleAuthRedirect = (req, res) => {
  const googleAuthUrl = getGoogleAuthUrl();

  return res.redirect(googleAuthUrl);
};

//VERIFY EMAIL
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  await verifyUserEmail(token);

  return sendResponse(res, "Email verified successfully", 200);
});

//CREATE NEW ACCESS TOKEN

export const refreshUser = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  const newAccessToken = await refreshAccessToken(refreshToken);

  res.cookie("accessToken", newAccessToken, cookie15Min);

  return sendResponse(res, "Access token refreshed", 200);
});
