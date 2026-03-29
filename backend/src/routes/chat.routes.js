import express from "express";
import multer from "multer";
import { chatPromptEnhancer } from "../controllers/chat.controller.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

router.post("/chat", upload.any(), chatPromptEnhancer);

export default router;