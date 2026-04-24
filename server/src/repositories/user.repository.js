import User from "../models/user.model.js";

const findByEmail = (email) => {
  return User.findOne({ email });
};

const createUser = (data) => {
  return User.create(data);
};
const findByEmailSelectPassword = (email) => {
  return User.findOne({ email }).select("+password");
};

const createGoogleUser = (data) => {
  return User.create(data);
};

const saveUser = (user) => {
  return user.save();
};

const verifyUserById = (userId) => {
  return User.findByIdAndUpdate(userId, { isVerified: true }, { new: true });
};

export {
  findByEmail,
  createUser,
  findByEmailSelectPassword,
  createGoogleUser,
  saveUser,
  verifyUserById
};
