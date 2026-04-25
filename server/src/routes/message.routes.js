import express from "express";
import { getMessages } from "../controllers/message.controller.js";

const router = express.Router();

//  keep only for fetching
router.get("/messages/:conversationId", getMessages);

//  REMOVE public create route (important)
// router.post("/messages", createMessage);

export default router;