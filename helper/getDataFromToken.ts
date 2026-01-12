import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export const getDataFromToken = (request: NextRequest): string => {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      throw new Error("Missing token");
    }

    const decoded: any = jwt.verify(token, process.env.TOKEN_SECRET!);

    return decoded.id;
  } catch (error) {
    throw new Error("Invalid or missing token");
  }
};