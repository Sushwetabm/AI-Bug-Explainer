const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
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
  process.env.FRONTEND_URL,
  "http://localhost:5000", // frontend local dev
  "http://localhost:3000",
];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       console.log("Origin attempting request:", origin);
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     credentials: true,
//   })
// );
app.use(
  cors({
    origin:
      process.env.FRONTEND_URL ||
      "https://ai-bug-explainer-production.up.railway.app",
    credentials: true, // ⬅️ Needed if sending cookies or Authorization header
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Optional but helps for preflight requests
app.options("*", cors());

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

//SWAGGER REMOVED VERSION
// const express = require("express");
// const helmet = require("helmet");
// const morgan = require("morgan");
// const rateLimit = require("express-rate-limit");
// const cors = require("cors");
// const {
//   errorHandler,
//   errorConverter,
//   errorLogger,
// } = require("./middleware/errorHandler");
// const notFoundHandler = require("./middleware/notFoundHandler");
// const logger = require("./utils/logger");
// const routes = require("./routes");
// // const { swaggerSetup } = require("./config/swagger"); // ← COMMENTED OUT

// const app = express();

// // Security headers
// app.use(helmet());

// // ✅ Allow these frontend URLs to access the backend
// const allowedOrigins = [
//   "https://ai-bug-explainer-production.up.railway.app", // frontend on Railway
//   process.env.FRONTEND_URL,
//   "http://localhost:5000", // frontend local dev
//   "http://localhost:3000",
// ];

// app.use(
//   cors({
//     origin:
//       process.env.FRONTEND_URL ||
//       "https://ai-bug-explainer-production.up.railway.app",
//     credentials: true, // ⬅️ Needed if sending cookies or Authorization header
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

// // Optional but helps for preflight requests
// app.options("*", cors());

// // Logging
// app.use(morgan("combined", { stream: logger.stream }));

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   message: "Too many requests from this IP, please try again later",
// });
// app.use(limiter);

// // Body parsing
// app.use(express.json({ limit: "10kb" }));
// app.use(express.urlencoded({ extended: true }));

// // Swagger docs - TEMPORARILY DISABLED
// // swaggerSetup(app);

// // Main API routes
// app.use("/api", routes);

// // Health check route
// app.get("/health", (req, res) => {
//   res.status(200).json({ status: "healthy" });
// });

// // Temporary API docs placeholder
// app.get("/api-docs", (req, res) => {
//   res.json({ message: "API documentation temporarily disabled for debugging" });
// });

// // 404 and Error handling
// app.use(notFoundHandler);
// app.use(errorConverter);
// app.use(errorLogger);
// app.use(errorHandler);

// module.exports = app;
