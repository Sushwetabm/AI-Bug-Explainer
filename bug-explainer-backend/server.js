require("dotenv").config();

const app = require("./src/app");
const { port } = require("./src/config");
const logger = require("./src/utils/logger");
const { connectDB } = require("./src/config/database");

let server; // declare server in outer scope
connectDB().then(() => {
  server = app.listen(port, () => {
    logger.info(`✅ Server running on port ${port}`);
    console.log(`✅ Server running on port ${port}`);
  });

  process.on("unhandledRejection", (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });

  process.on("uncaughtException", (err) => {
    logger.error(`Uncaught Exception: ${err.message}`);
    process.exit(1);
  });
});

module.exports = server;
