const httpStatus = require("http-status").default;
const jwt = require("jsonwebtoken");
const config = require("../config");
const ApiError = require("../utils/ApiError");
const User = require("../models/User");
const crypto = require("crypto");
const Token = require("../models/Token");
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/email");

const register = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }
  return await User.create(userBody);
};

const login = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect email or password");
  }

  const passwordMatch = await user.isPasswordMatch(password);
  if (!passwordMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect email or password");
  }

  return user;
};
// Forgot Password
const forgotPassword = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  await Token.findOneAndDelete({ user: user._id });

  await Token.create({
    user: user._id,
    token: hashedToken,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
  });

  const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

  const htmlMessage = `
    <h2>Password Reset Request</h2>
    <p>Hello ${user.name || "User"},</p>
    <p>You requested to reset your password.</p>
    <p><a href="${resetLink}" target="_blank">Click here to reset your password</a></p>
    <p>This link is valid for 15 minutes.</p>
  `;

  await sendEmail(user.email, "Reset your password", htmlMessage);

  return resetLink;
};
const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const resetTokenDoc = await Token.findOne({
    token: hashedToken,
    expiresAt: { $gt: new Date() },
  });

  if (!resetTokenDoc) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid or expired token");
  }

  const user = await User.findById(resetTokenDoc.user);
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  await Token.deleteOne({ _id: resetTokenDoc._id }); // Remove used token
};

const generateAuthTokens = (user) => {
  const accessToken = jwt.sign({ id: user.id }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });

  return {
    access: {
      token: accessToken,
      expires: new Date(Date.now() + config.jwt.expiresIn * 1000),
    },
  };
};

module.exports = {
  register,
  login,
  generateAuthTokens,
  forgotPassword,
  resetPassword,
};
