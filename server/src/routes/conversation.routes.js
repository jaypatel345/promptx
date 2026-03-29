import express from "express";
import {
  createConversation,
  listConversations,
  deleteConversation,
  renameConversation,
  pinConversation,
} from "../controllers/conversation.controller.js";

const router = express.Router();

router.post("/conversations", createConversation);

router.get("/conversations", listConversations);

router.delete("/conversations/:id", deleteConversation);

router.patch("/conversations/:id/title", renameConversation);

router.patch("/conversations/:id/pin", pinConversation);

export default router;