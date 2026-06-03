import express from "express";
import { loadEnv } from "./src/config/env.js";
import authRoutes from "./src/routes/auth.routes.js";
import cookieParser from "cookie-parser";
import errorHandler from "./src/middlewares/error.middleware.js";
import userRoutes from "./src/routes/user.routes.js";
import askRoutes from "./src/routes/ask.routes.js";
import teamRoutes from "./src/routes/team.routes.js";
import messageRoutes from "./src/routes/message.routes.js";
import conversationRoutes from "./src/routes/conversation.routes.js";
import chatRoutes from "./src/routes/chat.routes.js";
import cors from "cors";
import requestLogger from "./src/middlewares/requestLogger.js";
import testRoutes from "./src/routes/test.route.js";
import { requestIdMiddleware } from "./src/middlewares/requestId.middleware.js";
import healthRoutes from "./src/routes/health.routes.js";
import { errorMiddleware } from "./src/middlewares/errorMiddleware.js";
import queueRoutes from "./src/routes/queue.routes.js";

const app = express();

console.log("Server starting...");

loadEnv();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);
app.use(requestIdMiddleware);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // curl/postman/server-to-server

      const normalize = (value) => value.trim().replace(/\/+$/, "");

      const envOrigins = [
        process.env.CLIENT_URL,
        process.env.FRONTEND_URL,
        process.env.DOMAIN,
      ]
        .filter(Boolean)
        .map(normalize);

      const allowlist = new Set([
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://promptx.co.in",
        "https://www.promptx.co.in",
        "https://api.promptx.co.in",
        ...envOrigins,
      ]);

      const lanDevRegex =
        /^http:\/\/(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}):3000$/;
      const vercelPreviewRegex = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i;

      const normalizedOrigin = normalize(origin);

      if (
        allowlist.has(normalizedOrigin) ||
        lanDevRegex.test(normalizedOrigin) ||
        vercelPreviewRegex.test(normalizedOrigin)
      ) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
  }),
);

// routes
app.use("/api/auth", authRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api", askRoutes);
app.use("/api", teamRoutes);

//  NEW MAIN CHAT ROUTE
app.use("/api", chatRoutes);
app.use("/api", messageRoutes);
app.use("/api", conversationRoutes);

//Redis Test Route
app.use("/api", testRoutes);

//health check route
app.use("/health", healthRoutes);
// GLOBAL ERROR HANDLER
if (process.env.NODE_ENV !== "test") {
  app.use(queueRoutes);
}
app.use(errorHandler);
app.use(errorMiddleware);
export default app;
