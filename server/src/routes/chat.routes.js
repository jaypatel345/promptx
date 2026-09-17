import express from "express";
import { sendMessage, cancelMessage } from "../controllers/chat.controller.js";
import multer from "multer";
import { optionalAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// single unified route
router.post("/chat/send", optionalAuth, upload.any(), sendMessage);
router.post("/chat/cancel/:aiJobId", optionalAuth, cancelMessage);

export default router;
