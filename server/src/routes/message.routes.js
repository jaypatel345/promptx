import express from "express";
import { getMessages } from "../controllers/message.controller.js";
import { optionalAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

//  keep only for fetching
router.get("/messages/:conversationId", optionalAuth, getMessages);

//  REMOVE public create route (important)
// router.post("/messages", createMessage);

export default router;
