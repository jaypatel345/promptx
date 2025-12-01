import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "please provide an email"],
  },
  username: {
    type: String,
    required: [true, "please provide a username"],
  },
  password: {
    type: String,
    required: [true, "please provide a password"],
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