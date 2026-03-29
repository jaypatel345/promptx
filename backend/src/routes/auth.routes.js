import express from "express";
import { signupUser, loginUser, logoutUser, googleCallback, googleLogin, verifyEmail } from "../controllers/auth.controller.js";

const router = express.Router();
console.log("Auth routes loaded");

router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/callback", googleCallback);
router.get("/google", googleLogin);
router.post("/verifyemail", verifyEmail);


export default router;