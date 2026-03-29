import express from "express";
import {
  getMessages,
  createMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/messages/:conversationId", getMessages);

router.post("/messages", createMessage);

export default router;