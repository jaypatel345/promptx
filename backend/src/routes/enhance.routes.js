import express from "express";
import { enhancePrompt } from "../controllers/enhance.controller.js";

const router = express.Router();

router.post("/enhance", enhancePrompt);

export default router;