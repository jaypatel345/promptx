import jwt from "jsonwebtoken";

export const getDataFromToken = (req) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) return null;

    const decoded = jwt.verify(token, process.env.ACCESSTOKEN_SECRET);

    return decoded.id;
  } catch (error) {
    return null;
  }
};
