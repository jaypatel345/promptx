import mongoose, { Schema } from "mongoose";

const ConversationSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  guestId: { type: String, required: false },
  title: String,
  createdAt: { type: Date, default: Date.now },
});
export default mongoose.models.Conversation ||
  mongoose.model("Conversation", ConversationSchema);
