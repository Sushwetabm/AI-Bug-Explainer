const httpStatus = require("http-status").default;
const jwt = require("jsonwebtoken");
const config = require("../config");
const ApiError = require("../utils/ApiError");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const register = async (userBody) => {
  const { email, password } = userBody;
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email is required");
  }
  if (!password) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Password is required");
  }

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new ApiError(httpStatus.CONFLICT, "Email is already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    email: normalizedEmail,
    password: hashedPassword,
  });

  return user;
};

const login = async (email, password) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect email or password");
  }

  return user;
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
};
