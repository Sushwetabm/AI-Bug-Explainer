const { User } = require("../../src/models");

const userOne = {
  email: "test@example.com",
  password: "Test123!",
};

const setupDatabase = async () => {
  await User.deleteMany();
  await new User(userOne).save();
};

module.exports = {
  userOne,
  setupDatabase,
};
