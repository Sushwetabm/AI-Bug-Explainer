class ApiError extends Error {
  constructor(statusCode = 500, message, isOperational = true, stack = "") {
    super(message);

    Object.defineProperties(this, {
      statusCode: {
        value: statusCode,
        enumerable: true,
        writable: false,
        configurable: false,
      },
      isOperational: {
        value: isOperational,
        enumerable: true,
      },
    });

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = ApiError;
