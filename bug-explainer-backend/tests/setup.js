const mongoose = require("mongoose");
const { database } = require("../src/config");
const logger = require("../src/utils/logger");

const testDatabaseURI =
  process.env.MONGODB_TEST_URI ||
  database.uri.replace(/(.*)(?=\/|$)/, "$1_test");

beforeAll(async () => {
  await mongoose.connect(testDatabaseURI, database.options);
  logger.info(`Test database connected to ${testDatabaseURI}`);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  logger.info("Test database disconnected");
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
