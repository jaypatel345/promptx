import express from "express";
import { askPromptX } from "../controllers/ask.controller.js";

const router = express.Router();

router.post("/ask", askPromptX);

export default router; 