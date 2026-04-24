import jwt from "jsonwebtoken";

export const generateRefreshToken = (userId, expires = "7d") => {
 return  jwt.sign({ id: userId }, process.env.REFRESHTOKEN_SECRET, {
    expiresIn: expires,
  });
};

export const generateAccessToken = (userId, expires = "15m") => {
 return jwt.sign({ id: userId }, process.env.ACCESSTOKEN_SECRET, {
    expiresIn: expires,
  });
};
