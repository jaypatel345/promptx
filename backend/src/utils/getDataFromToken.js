import jwt from "jsonwebtoken";

export const getDataFromToken = (req) => {
  try {
    const token = req.cookies?.token;

    if (!token) return null;

    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

    return decoded.id;
  } catch (error) {
    return null;
  }
};