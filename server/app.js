import express from "express";
import authRoutes from "./src/routes/auth.routes.js";
import cookieParser from "cookie-parser";
import errorHandler from "./src/middlewares/error.middleware.js";
import userRoutes from "./src/routes/user.routes.js";
import askRoutes from "./src/routes/ask.routes.js";
import enhanceRoutes from "./src/routes/enhance.routes.js";
import searchRoutes from "./src/routes/search.routes.js";
import chatRoutes from "./src/routes/chat.routes.js";
import messageRoutes from "./src/routes/message.routes.js";
import conversationRoutes from "./src/routes/conversation.routes.js";
import cors from "cors";

const app = express();

// Middlewares
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
// app.options("*", cors());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api", askRoutes);
app.use("/api", enhanceRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", searchRoutes);
app.use("/api", chatRoutes);
app.use("/api", messageRoutes);
app.use("/api", conversationRoutes);

// GLOBAL ERROR HANDLER
app.use(errorHandler);

export default app;
