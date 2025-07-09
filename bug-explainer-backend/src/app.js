const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
//const { errorHandler } = require("./middleware/errorHandler");
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

// Security middleware
app.use(helmet());
const allowedOrigins = [
  "https://ai-bug-explainer-production.up.railway.app",
  "http://localhost:5173", // for local dev
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// This must come **after** the CORS config
app.options(
  "*",
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Request logging
app.use(morgan("combined", { stream: logger.stream }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later",
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// Swagger documentation
swaggerSetup(app);

// API routes
app.use("/api", routes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

// 404 handler
app.use(notFoundHandler);

app.use(errorConverter);
app.use(errorLogger);
app.use(errorHandler);

module.exports = app;
