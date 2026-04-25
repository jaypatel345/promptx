import { chatService } from "../services/chat.service.js";

export const sendMessage = async (req, res, next) => {
  try {
    const result = await chatService.sendMessage(req);
    res.json(result);
  } catch (err) {
    next(err);
  }
};