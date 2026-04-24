import Conversation from "../models/conversation.model.js";

export const conversationRepository = {
  // CREATE
  create: async (data) => {
    return Conversation.create(data);
  },

  // READ
  find: async (query) => {
    return Conversation.find(query).sort({
      pinnedAt: -1,
      createdAt: -1,
    });
  },

  findOne: async (query) => {
    return Conversation.findOne(query);
  },

  findById: async (id) => {
    return Conversation.findById(id);
  },

  exists: async (query) => {
    return Conversation.exists(query);
  },

  // DELETE
  findOneAndDelete: async (query) => {
    return Conversation.findOneAndDelete(query);
  },

  // UPDATE
  save: async (conversation) => {
    return conversation.save();
  },
};