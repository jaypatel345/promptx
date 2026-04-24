import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    guestId: {
      type: String,
    },

    title: {
      type: String,
      trim: true,
    },

    pinnedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

conversationSchema.index({
  userId: 1,
  pinned: -1,
  createdAt: -1,
});
conversationSchema.index({
  guestId: 1,
  pinnedAt: -1,
  createdAt: -1,
});

export default mongoose.model("Conversation", conversationSchema);
