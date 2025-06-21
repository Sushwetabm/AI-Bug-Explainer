const httpStatus = require("http-status").default;
const ApiError = require("../utils/ApiError");

const notFoundHandler = (req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
};

module.exports = notFoundHandler;
