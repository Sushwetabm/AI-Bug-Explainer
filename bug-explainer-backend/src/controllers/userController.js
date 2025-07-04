const httpStatus = require("http-status").default;
const ApiError = require("../utils/ApiError");
const User = require("../models/User");

const getCurrentUser = async (req, res, next) => {
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
          name: user.name,
          created_at: user.created_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, email, password, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    // Require current password
    const inputPassword = password?.trim();
    if (!inputPassword) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Current password is required to update profile"
      );
    }

    const isMatch = await user.isPasswordMatch(inputPassword);
    if (!isMatch) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect current password");
    }

    // Update email
    if (email && email !== user.email) {
      const emailTaken = await User.isEmailTaken(email, req.user.id);
      if (emailTaken) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Email already in use");
      }
      user.email = email;
    }

    // Update name
    if (name) user.name = name;

    // Update password
    if (newPassword && newPassword.trim().length >= 8) {
      user.password = newPassword.trim();
    }

    await user.save();

    res.status(httpStatus.OK).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
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
  getCurrentUser,
  updateProfile,
};
