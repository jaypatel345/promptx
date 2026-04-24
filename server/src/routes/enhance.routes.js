import express from "express";
import multer from "multer";
import { enhancePrompt } from "../controllers/enhance.controller.js";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post("/enhance", upload.any(), enhancePrompt);

export default router;