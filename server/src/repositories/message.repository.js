import Message from "../models/message.model.js";

export const messageRepository = {
  create: async (data) => {
    return Message.create(data);
  },

  findByConversation: async (query) => {
    return Message.find(query)
      .sort({ createdAt: 1, _id: 1 })
      .limit(50);
  },
};