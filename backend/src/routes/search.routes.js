import express from "express";
import { searchTeam } from "../controllers/search.controller.js";

const router = express.Router();

router.get("/search", searchTeam);

export default router;