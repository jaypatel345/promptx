import express from "express";
import authRoutes from "./src/routes/auth.routes.js";
import cookieParser from "cookie-parser";
import errorHandler from "./src/middlewares/error.middleware.js";
import userRoutes from "./src/routes/user.routes.js";
import askRoutes from "./src/routes/ask.routes.js";
import enhanceRoutes from "./src/routes/enhance.routes.js";
import teamRoutes from "./src/routes/team.routes.js";
import messageRoutes from "./src/routes/message.routes.js";
import conversationRoutes from "./src/routes/conversation.routes.js";
import cors from "cors";
import requestLogger from "./src/middlewares/requestLogger.js";

const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

// routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api", askRoutes);
app.use("/api", enhanceRoutes);
app.use("/api", teamRoutes);
app.use("/api", messageRoutes);
app.use("/api", conversationRoutes);

// GLOBAL ERROR HANDLER
app.use(errorHandler);

export default app;
