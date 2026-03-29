import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGODB = process.env.MONGODB_URI || "";

export const connectDB = async () => {
  if (!MONGODB) {
    throw new Error("MONGODB_URI is missing in environment variables");
  }

  try {
    const db = await mongoose.connect(MONGODB);

    const connection = db.connection;

    connection.on("connected", () => {
      console.log("MongoDB connection established");
    });

    connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  }
};