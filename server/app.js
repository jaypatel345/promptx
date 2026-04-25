import express from "express";
import authRoutes from "./src/routes/auth.routes.js";
import cookieParser from "cookie-parser";
import errorHandler from "./src/middlewares/error.middleware.js";
import userRoutes from "./src/routes/user.routes.js";
import askRoutes from "./src/routes/ask.routes.js";
// import enhanceRoutes from "./src/routes/enhance.routes.js";  remove later
import teamRoutes from "./src/routes/team.routes.js";
import messageRoutes from "./src/routes/message.routes.js";
import conversationRoutes from "./src/routes/conversation.routes.js";
import chatRoutes from "./src/routes/chat.routes.js"; //  NEW
import cors from "cors";
import requestLogger from "./src/middlewares/requestLogger.js";

const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // curl/postman/server-to-server

      const allowlist = new Set([
        "http://localhost:3000",
        "http://127.0.0.1:3000",
      ]);

      const lanDevRegex = /^http:\/\/(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}):3000$/;

      if (allowlist.has(origin) || lanDevRegex.test(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  }),
);

// routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api", askRoutes);
// app.use("/api", enhanceRoutes);  REMOVE from public usage
app.use("/api", teamRoutes);

//  NEW MAIN CHAT ROUTE
app.use("/api", chatRoutes);

app.use("/api", messageRoutes); // keep for GET only
app.use("/api", conversationRoutes);

// GLOBAL ERROR HANDLER
app.use(errorHandler);

export default app;
