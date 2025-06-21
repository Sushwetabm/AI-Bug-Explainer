const httpStatus = require("http-status").default;
const logger = require("../utils/logger");
const ApiError = require("../utils/ApiError");

const errorConverter = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    // Handle Mongoose validation errors
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors)
        .map((val) => val.message)
        .join(", ");
      error = new ApiError(httpStatus.BAD_REQUEST, message);
    }
    // Handle unauthorized errors
    else if (err.message.includes("Incorrect email or password")) {
      error = new ApiError(httpStatus.UNAUTHORIZED, err.message);
    }
    // Default to internal server error
    else {
      const statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message || httpStatus[statusCode];
      error = new ApiError(statusCode, message, false, err.stack);
    }
  }

  next(error);
};
// Add this before errorHandler in your middleware chain
const errorLogger = (err, req, res, next) => {
  logger.error("Error:", {
    message: err.message,
    statusCode: err.statusCode,
    stack: err.stack,
  });
  next(err);
};
const errorHandler = (err, req, res, next) => {
  // If headers already sent, delegate to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  const message = err.message || httpStatus[statusCode];

  // In production, don't leak error details
  if (process.env.NODE_ENV === "production" && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }

  const response = {
    success: false,
    error: {
      code: statusCode,
      message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  };

  res.status(statusCode).json(response);
};

module.exports = {
  errorHandler,
  errorLogger,
  errorConverter,
};
