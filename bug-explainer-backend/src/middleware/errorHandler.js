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
    // Handle incorrect credentials (example)
    else if (
      typeof err.message === "string" &&
      err.message.includes("Incorrect email or password")
    ) {
      error = new ApiError(httpStatus.UNAUTHORIZED, err.message);
    } else {
      // Default wrap: ensure statusCode is defined
      const code =
        err.statusCode && Number.isInteger(err.statusCode)
          ? err.statusCode
          : httpStatus.INTERNAL_SERVER_ERROR;
      const msg = err.message || httpStatus[code];
      // Mark isOperational=false so that in production we do not leak details
      error = new ApiError(code, msg, false, err.stack);
    }
  }

  // Pass the ApiError to the next handler
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

  let statusCode =
    err.statusCode && Number.isInteger(err.statusCode)
      ? err.statusCode
      : httpStatus.INTERNAL_SERVER_ERROR;
  let message = err.message || httpStatus[statusCode];

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
