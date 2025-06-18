const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");

const notFoundHandler = (req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
};

module.exports = notFoundHandler;
