const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf, colorize, json } = format;

const devFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

const prodFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    process.env.NODE_ENV === "production" ? json() : colorize()
  ),
  transports: [
    new transports.Console({
      format: combine(
        timestamp(),
        process.env.NODE_ENV === "production" ? prodFormat : devFormat
      ),
    }),
    new transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
    new transports.File({ filename: "logs/combined.log" }),
  ],
  exitOnError: false,
});

logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

module.exports = logger;
