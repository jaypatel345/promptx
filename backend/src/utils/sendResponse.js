export const sendResponse = (res, message, statusCode, data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};