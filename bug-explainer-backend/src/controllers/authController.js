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
          created_at: user.created_at,
        },
        token: tokens.access.token,
      },
    });
  } catch (error) {
    //console.error("Registration error:", error);
    next(error);
  }
};

//I WORK
// const login = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;
//     const user = await authService.login(email, password);
//     const tokens = await authService.generateAuthTokens(user);
//     res.json({
//       success: true,
//       data: {
//         user: {
//           id: user.id,
//           email: user.email,
//           created_at: user.created_at,
//         },
//         token: tokens.access.token,
//       },
//     });
//   } catch (error) {
//     // Specifically handle authentication errors
//     if (error.message === "Incorrect email or password") {
//       return res.status(401).json({
//         success: false,
//         error: {
//           code: 401,
//           message: error.message,
//           ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
//         },
//       });
//     }
//     next(error);
//   }
// };
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
          created_at: user.created_at,
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
          created_at: user.created_at,
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
