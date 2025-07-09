const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const {
  errorHandler,
  errorConverter,
  errorLogger,
} = require("./middleware/errorHandler");
const notFoundHandler = require("./middleware/notFoundHandler");
const logger = require("./utils/logger");
const routes = require("./routes");
const { swaggerSetup } = require("./config/swagger");

const app = express();

// Security headers
app.use(helmet());

// ✅ Allow these frontend URLs to access the backend
const allowedOrigins = [
  "https://ai-bug-explainer-production.up.railway.app", // frontend on Railway
  "http://localhost:5000", // frontend local dev
];

// ✅ CORS handler middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // ✅ Respond to preflight OPTIONS requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// Logging
app.use(morgan("combined", { stream: logger.stream }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later",
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// Swagger docs
swaggerSetup(app);

// Main API routes
app.use("/api", routes);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

// 404 and Error handling
app.use(notFoundHandler);
app.use(errorConverter);
app.use(errorLogger);
app.use(errorHandler);

module.exports = app;
