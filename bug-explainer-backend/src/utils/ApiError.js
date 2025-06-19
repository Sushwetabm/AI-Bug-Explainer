class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = "") {
    super(message);

    // Ensure properties stay enumerable and configurable
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
