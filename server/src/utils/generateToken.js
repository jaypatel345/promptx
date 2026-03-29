import jwt from "jsonwebtoken";

export const generateToken = (userId, expires = "1d") =>
  jwt.sign({ id: userId }, process.env.TOKEN_SECRET, { expiresIn: expires });