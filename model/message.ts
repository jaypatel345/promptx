import { Schema } from "mongoose";
import mongoose from "mongoose";
const messageSchema = new Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation" },
  role: String,
  content: String,
  attachments: [],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Message ||
  mongoose.model("message", messageSchema);
