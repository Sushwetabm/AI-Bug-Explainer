const httpStatus = require("http-status").default;
const ApiError = require("../utils/ApiError");
const User = require("../models/User");

const getUserProfile = async (req, res, next) => {
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
          created_at: user.created_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
};
