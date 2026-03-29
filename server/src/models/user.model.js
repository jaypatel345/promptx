import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "please provide an email"],
    unique: true,
  },

  username: {
    type: String,
  },

  password: {
    type: String, // Google users may not have password
  },

  provider: {
    type: String,
    enum: ["credentials", "google"],
    default: "credentials",
  },

  googleId: {
    type: String,
  },

  avatar: {
    type: String,
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

userSchema.index({verifyToken:1,verifyTokenExpiry:1});

// userSchema.index({googleId:1});

// important fix
const User = mongoose.model("User", userSchema);

export default User;