const mongoose = require("mongoose");
const { database } = require(".");
const logger = require("../utils/logger");

const connectDB = async () => {
  try {
    await mongoose.connect(database.uri, database.options);
    logger.info("MongoDB connected successfully");

    logger.info(`✅ Connected to MongoDB: ${database.uri}`);
  } catch (err) {
    logger.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    logger.info("MongoDB disconnected successfully");
  } catch (err) {
    logger.error(`MongoDB disconnection error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = { connectDB, disconnectDB };
