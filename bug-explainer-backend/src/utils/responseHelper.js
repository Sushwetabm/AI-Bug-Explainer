const httpStatus = require("http-status").default;

const successResponse = (res, data, statusCode = httpStatus.OK) => {
  res.status(statusCode).json({
    success: true,
    data,
  });
};

const errorResponse = (
  res,
  error,
  statusCode = httpStatus.INTERNAL_SERVER_ERROR
) => {
  res.status(statusCode).json({
    success: false,
    error: {
      code: statusCode,
      message: error.message || httpStatus[statusCode],
    },
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
