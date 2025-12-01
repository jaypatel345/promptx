import mongoose, { Connection } from "mongoose";

declare global {
  // Allow global caching in Next.js (avoids re-opening connections on hot reload)
  // eslint-disable-next-line no-var
  var mongooseConnection: {
    isConnected: boolean;
  } | undefined;
}

const MONGODB_URI: string = process.env.MONGODB_URI ?? "";

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is missing in environment variables");
}

export const connectDB = async (): Promise<void> => {
  // Use global cache to avoid multiple connections in dev/Next.js hot reload
  if (!global.mongooseConnection) {
    global.mongooseConnection = { isConnected: false };
  }

  if (global.mongooseConnection.isConnected) {
    console.log("⚡ MongoDB already connected");
    return;
  }

  try {
    // `connect` returns a Mongoose instance (typed)
    const db = await mongoose.connect(MONGODB_URI);

    const connection: Connection = db.connection;

    connection.on("connected", () => {
      console.log("MongoDB connection established");
    });

    connection.on("error", (err: Error) => {
      console.error("MongoDB connection error:", err);
    });

    global.mongooseConnection.isConnected = true;
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    throw new Error("MongoDB connection failed");
  }
};