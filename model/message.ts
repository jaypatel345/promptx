import { Schema } from "mongoose";
import mongoose from "mongoose";

const messageSchema = new Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  attachments: {
    type: Array,
    default: [],
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Message ||
  mongoose.model("Message", messageSchema);