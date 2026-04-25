import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

export const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    throw new ApiError(401, "Not authorized, token missing");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.ACCESSTOKEN_SECRET);
  } catch {
    throw new ApiError(401, "Invalid token");
  }

  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    throw new ApiError(401, "User not found");
  }

  req.user = user;
  next();
});



export const optionalAuth = (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
return next(); // allow guest
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESSTOKEN_SECRET);

    // Keep it non-async to preserve middleware signature; hydrate user in background
    User.findById(decoded.id)
      .select("-password")
      .then((user) => {
        if (user) req.user = user;
      })
      .finally(() => next());
  } catch {
    next(); // invalid token -> guest
  }
};
