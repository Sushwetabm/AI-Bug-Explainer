const httpStatus = require("http-status").default;
const ApiError = require("../utils/ApiError");
const { authService } = require("../services");
const User = require("../models/User");

const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    const tokens = await authService.generateAuthTokens(user);
    res.status(httpStatus.CREATED).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          created_at: user.createdAt,
        },
        token: tokens.access.token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await authService.login(email, password);
    const tokens = await authService.generateAuthTokens(user);
    res.status(httpStatus.OK).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          created_at: user.createdAt,
        },
        token: tokens.access.token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          created_at: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
};
