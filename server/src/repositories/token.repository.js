import Token from "../models/token.model.js";

const storeRefreshToken = (token, userId) => {
  return Token.create({
    userId,
    token,
    type: "refresh",
    expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
};

const findRefreshToken = (token) => {
  return Token.findOne({
    token,
    type: "refresh",
  });
};

const findValidVerifyToken = (token) => {
  return Token.findOne({
    token,
    type: "verify",
    expiry: { $gt: new Date() },
  });
};

const deleteTokenById = (id) => {
  return Token.findByIdAndDelete(id);
};
export {
  storeRefreshToken,
  findRefreshToken,
  findValidVerifyToken,
  deleteTokenById,
};
