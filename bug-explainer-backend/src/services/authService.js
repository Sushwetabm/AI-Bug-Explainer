const httpStatus = require("http-status");
const jwt = require("jsonwebtoken");
const config = require("../config");
const ApiError = require("../utils/ApiError");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// const register = async (userBody) => {
//   if (await User.isEmailTaken(userBody.email)) {
//     throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
//   }
//   return await User.create(userBody);
// };

const register = async (userBody) => {
  const { email, password } = userBody;

  if (!email) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email is required");
  }
  if (!password) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Password is required");
  }
  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    // 409 Conflict is appropriate
    throw new ApiError(httpStatus.CONFLICT, "Email is already registered");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    email,
    password: hashedPassword,
  });
  return user;
};
const login = async (email, password) => {
  const user = await User.findOne({ email });
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
