import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getDataFromToken } from "../utils/getDataFromToken.js";
import { sendResponse } from "../utils/sendResponse.js";

// CURRENT USER
export const getCurrentUser = asyncHandler(async (req, res) => {
  const userId = getDataFromToken(req);
  
  if (!userId) {
    return sendResponse(res, "Guest user", 200, {
      user: null,
      isGuest: true,
    });
  }

  const user = await User.findById(userId).select(
    "email username avatar provider googleId joined isVerified isAdmin",
  );

  if (!user) {
    return sendResponse(res, "Guest user", 200, {
      user: null,
      isGuest: true,
    });
  }

  return sendResponse(res, "User fetched", 200, {
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
});
