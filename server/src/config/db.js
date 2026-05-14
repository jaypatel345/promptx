import mongoose from "mongoose";
import { loadEnv } from "./env.js";

loadEnv();

const MONGODB = process.env.MONGODB_URI || "";

class MongoDB {
  static instance;

  static async connect() {
    if (!MONGODB) {
      throw new Error("MONGODB_URI is missing in environment variables");
    }

    try {
      if (this.instance) {
        console.log("MongoDB already connected");
        return this.instance;
      }

      const db = await mongoose.connect(MONGODB);

      this.instance = db;

      const connection = db.connection;

      console.log("MongoDB connected successfully", {
        host: connection.host,
        name: connection.name,
        readyState: connection.readyState,
      });

      connection.on("connected", () => {
        console.log("MongoDB connection established");
      });

      connection.on("error", (err) => {
        console.error("MongoDB connection error:", err);
      });

      return db;
    } catch (err) {
      console.error("MongoDB connection failed:", err);
      process.exit(1);
    }
  }
}
export default MongoDB;
