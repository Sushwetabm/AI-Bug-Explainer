const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { version } = require("../../package.json");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Bug Explainer API",
      version,
      description:
        "API for identifying code bugs and providing educational explanations",
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === "production"
            ? `${process.env.RAILWAY_PUBLIC_DOMAIN || "https://ai-bug-explainer-production-d771.up.railway.app"}/api`
            : "http://localhost:3000/api",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: [path.join(__dirname, "../routes/*.js")],
};

let swaggerSpec;

const swaggerSetup = (app) => {
  try {
    console.log(
      "📘 Swagger loading from:",
      path.join(__dirname, "../routes/*.js")
    );

    // Generate swagger spec
    swaggerSpec = swaggerJsdoc(options);

    // Swagger page
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Docs in JSON format
    app.get("/api-docs.json", (req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.send(swaggerSpec);
    });

    console.log("✅ Swagger documentation setup successful");
  } catch (err) {
    console.error("🔥 Swagger setup failed:");
    console.error(err.message || err);

    // Don't exit the process, just disable swagger
    console.log("⚠️  Continuing without Swagger documentation");

    // Provide a fallback route
    app.get("/api-docs", (req, res) => {
      res.status(503).json({
        error: "Swagger documentation temporarily unavailable",
        message:
          "API is running normally, but documentation is disabled due to configuration issues",
      });
    });
  }
};

module.exports = { swaggerSetup, swaggerSpec };
