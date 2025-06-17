require("dotenv").config();

const { NODE_ENV, PORT, MONGODB_URI, JWT_SECRET, JWT_EXPIRE } = process.env;

module.exports = {
  env: NODE_ENV || "development",
  port: PORT || 3000,
  database: {
    uri: MONGODB_URI || "mongodb://localhost:27017/bug_explainer",
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    },
  },
  jwt: {
    secret: JWT_SECRET || "your-secret-key",
    expiresIn: JWT_EXPIRE || "1h",
  },
  mlService: {
    url: process.env.ML_SERVICE_URL || "http://localhost:8000",
    timeout: parseInt(process.env.ML_SERVICE_TIMEOUT) || 30000,
  },
};
