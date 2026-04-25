import express from "express";
import { sendMessage } from "../controllers/chat.controller.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// single unified route
router.post("/chat/send", upload.any(), sendMessage);

export default router;