import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export const getDataFromToken = (request: NextRequest): string | null => {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) return null;

    const decoded: any = jwt.verify(token, process.env.TOKEN_SECRET!);

    return decoded.id;
  } catch (error) {
    return null;
  }
};