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
    decoded = jwt.verify(token, process.env.TOKEN_SECRET);
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
  const token = req.cookies?.token;

  if (!token) {
return next(); // allow guest
  }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      // ignore invalid token, treat as guest
      }

  next();
};