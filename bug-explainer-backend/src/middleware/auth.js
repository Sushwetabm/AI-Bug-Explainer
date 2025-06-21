const httpStatus = require("http-status").default;
const jwt = require("jsonwebtoken");
const config = require("../config"); // Changed import style
const ApiError = require("../utils/ApiError");

const auth =
  (required = true) =>
  async (req, res, next) => {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token && required) {
      return next(new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate"));
    }

    try {
      const payload = jwt.verify(token, config.jwt.secret); // Updated reference
      req.user = payload;
      return next();
    } catch (err) {
      if (required) {
        return next(new ApiError(httpStatus.UNAUTHORIZED, "Invalid token"));
      }
      return next();
    }
  };

module.exports = auth;
