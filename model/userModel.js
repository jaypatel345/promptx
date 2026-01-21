import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "please provide an email"],
    unique: true,
  },

  username: {
    type: String,
    required: false,
  },

  password: {
    type: String,
    required: false, // ❗ Google users won’t have a password
  },

  provider: {
    type: String,
    enum: ["credentials", "google"],
    default: "credentials",
  },

  googleId: {
    type: String,
    required: false,
  },

  avatar: {
    type: String,
    required: false,
  },

  isVerified: {
    type: Boolean,
    default: false,
  },

  isAdmin: {
    type: Boolean,
    default: false,
  },

  joined: {
    type: Date,
    default: Date.now,
  },

  forgotPasswordToken: String,
  forgotPasswordTokenExpiry: Date,

  verifyToken: String,
  verifyTokenExpiry: Date,
});

export default mongoose.models.User || mongoose.model("User", userSchema);