const app = require("./src/app");
const { PORT } = require("./src/config");
const logger = require("./src/utils/logger");

// Start the server
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  logger.error(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.error(`Error: ${err.message}`);
  process.exit(1);
});

module.exports = server;
