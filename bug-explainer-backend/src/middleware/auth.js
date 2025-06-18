const httpStatus = require("http-status");
const jwt = require("jsonwebtoken");
const { jwt } = require("../../config");
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
      const payload = jwt.verify(token, jwt.secret);
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
