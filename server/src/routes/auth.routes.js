import express from "express";
import {
  signupUser,
  loginUser,
  logoutUser,
  googleCallback,
  googleAuthRedirect,
  verifyEmail,
  refreshUser,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signupUser);
router.post("/register", signupUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/google", googleAuthRedirect);
router.get("/google/callback", googleCallback);
router.post("/verify-email", verifyEmail);
router.post("/refresh-token", refreshUser);

export default router;
