import { chatService } from "../services/chat.service.js";

export const sendMessage = async (req, res, next) => {
  try {
    console.log(
      JSON.stringify({
        level: "info",
        event: "chat.controller.received",
        service: "chat-controller",
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
        method: req.method,
        url: req.originalUrl,
        contentType: req.headers["content-type"],
        bodyKeys: Object.keys(req.body || {}),
        fileCount: req.files?.length || 0,
      }),
    );


console.log("AI SERVICE EXECUTED");
    const result = await chatService.sendMessage(req);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
