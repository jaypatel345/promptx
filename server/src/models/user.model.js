import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "please provide an email"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Invalid email"],
  },

  username: {
    type: String,
    trim: true,
    sparse: true,
  },

  password: {
    type: String,
    select: false,
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
    index: true,
  },
});

//indexes

// username
userSchema.index({ username: 1 }, { unique: true, sparse: true });

// Google login
userSchema.index({ googleId: 1 }, { unique: true, sparse: true });

// joined (for admin / sorting)
userSchema.index({ joined: -1 });

const User = mongoose.model("User", userSchema);

export default User;


