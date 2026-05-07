import pinoHttp from "pino-http";
import logger from "../config/logger.js";
import { randomUUID } from "crypto";

const requestLogger = pinoHttp({
  logger,
  genReqId: (req, res) => {
    const requestId = randomUUID();
    req.requestId = requestId;
    req.id = requestId;
    res.setHeader("X-Request-Id", requestId);
    res.requestId = requestId;
    return requestId;
  },
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.originalUrl || req.url} completed`;
  },
  customErrorMessage: (req, res, error) => {
    return `${req.method} ${req.originalUrl || req.url} failed: ${error.message}`;
  },
  customLogLevel: (req, res, error) => {
    if (error || res.statusCode >= 500) {
      return "error";
    }

    if (res.statusCode >= 400) {
      return "warn";
    }
    return "info";
  },
  serializers: {
    req(req) {
      return {
        requestId: req.requestId,
        method: req.method,
        url: req.originalUrl || req.url,
      };
    },

    res(res) {
      return {
        requestId: res.requestId || "unknown",
        statusCode: res.statusCode,
      };
    },
  },
});

export default requestLogger;
