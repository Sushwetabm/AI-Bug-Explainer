const express = require("express");
const axios = require("axios");
const validate = require("../middleware/validation");
const { codeAnalysisController } = require("../controllers");
const analysisValidation = require("../validations/analysis.validation");
const auth = require("../middleware/auth");
const router = express.Router();

// ML Service configuration from environment
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";
const ML_SERVICE_TIMEOUT = parseInt(process.env.ML_SERVICE_TIMEOUT) || 120000;

console.log("🔧 ML Service URL:", ML_SERVICE_URL);
console.log("🕐 ML Service Timeout:", ML_SERVICE_TIMEOUT + "ms");

/**
 * @swagger
 * /analysis/model/status:
 *   get:
 *     summary: Get ML model status
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Model status information
 *       503:
 *         description: ML service unavailable
 */
router.get("/model/status", auth(), async (req, res) => {
  try {
    const mlUrl = `${ML_SERVICE_URL}/model/status`;
    console.log(`🔍 Checking ML service at: ${mlUrl}`);
    console.log(`⏱️ Using timeout: ${ML_SERVICE_TIMEOUT}ms`);

    const response = await axios.get(mlUrl, {
      timeout: ML_SERVICE_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("✅ ML service responded successfully");
    res.json(response.data);
  } catch (error) {
    console.error("❌ ML service model status error:", error.message);

    // More detailed error logging
    if (error.code === "ECONNREFUSED") {
      console.error("🚨 Connection refused - ML service might not be running");
    } else if (error.code === "ECONNABORTED") {
      console.error(`🕐 Request timeout after ${ML_SERVICE_TIMEOUT}ms`);
    } else if (error.code === "ENOTFOUND") {
      console.error("🌐 Host not found - check ML_SERVICE_URL");
    }

    // Return a detailed fallback response
    res.status(503).json({
      loaded: false,
      ready: false,
      status: "error",
      message: "ML service unavailable",
      error: error.message,
      error_code: error.code,
      ml_service_url: ML_SERVICE_URL,
      timeout_used: ML_SERVICE_TIMEOUT,
    });
  }
});

/**
 * @swagger
 * /analysis/ml/health:
 *   get:
 *     summary: Check ML service health
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ML service health status
 *       503:
 *         description: ML service unavailable
 */
router.get("/ml/health", auth(), async (req, res) => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/health`, {
      timeout: 300000, // Shorter timeout for health check
    });

    res.json(response.data);
  } catch (error) {
    console.error("ML service health check error:", error.message);
    res.status(503).json({
      status: "error",
      message: "ML service health check failed",
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /analysis/submit:
 *   post:
 *     summary: Submit code for analysis
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - language
 *             properties:
 *               code:
 *                 type: string
 *               language:
 *                 type: string
 *                 enum: [javascript, python, java, cpp, c, php, typescript, go, rust]
 *     responses:
 *       201:
 *         description: Code submitted for analysis
 *       401:
 *         description: Unauthorized
 *       503:
 *         description: ML service unavailable
 */
router.post(
  "/submit",
  auth(),
  validate(analysisValidation.submitCode),
  async (req, res) => {
    try {
      const { code, language } = req.body;

      console.log(
        `🔍 Calling ML service at: ${ML_SERVICE_URL}/analysis/submit`
      );
      console.log(`📝 Code length: ${code.length}, Language: ${language}`);

      // Call ML service directly for immediate analysis
      const mlResponse = await axios.post(
        `${ML_SERVICE_URL}/analysis/submit`,
        {
          code,
          language,
        },
        {
          timeout: ML_SERVICE_TIMEOUT, // Use environment timeout
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ ML service responded successfully");
      console.log("📄 ML Response:", JSON.stringify(mlResponse.data, null, 2));

      // ✅ Wrap the ML service response in "result" as expected by frontend
      res.json({
        success: true,
        message: "Analysis completed successfully",
        result: mlResponse.data, // This is what your frontend expects!
      });
    } catch (error) {
      console.error("❌ ML Service analysis error:", error.message);

      if (error.code === "ECONNREFUSED") {
        console.error(
          "🚨 Cannot connect to ML service - is it running on port 8000?"
        );
      } else if (error.code === "ECONNABORTED") {
        console.error(`🕐 Analysis timeout after ${ML_SERVICE_TIMEOUT}ms`);
      }

      // ✅ Return fallback response wrapped in "result"
      res.status(503).json({
        success: false,
        message: "ML service is unavailable",
        result: {
          success: false,
          has_json_output: false,
          corrected_code: "",
          issues: [],
          raw_output: `ML service is unavailable: ${error.message}. Please make sure the ML service is running.`,
          model_status: "error",
          error: error.message,
        },
      });
    }
  }
);

/**
 * @swagger
 * /analysis/user/history:
 *   get:
 *     summary: Get user's analysis history
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [javascript, python, java, cpp, c, php, typescript, go, rust]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, failed]
 *     responses:
 *       200:
 *         description: Analysis history with pagination
 *       401:
 *         description: Unauthorized
 */
router.get("/user/history", auth(), codeAnalysisController.getUserAnalyses);

/**
 * @swagger
 * /analysis/{analysisId}:
 *   get:
 *     summary: Get analysis results
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: analysisId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the analysis to retrieve
 *     responses:
 *       200:
 *         description: Analysis results
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Analysis not found
 *   delete:
 *     summary: Delete an analysis
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: analysisId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the analysis to delete
 *     responses:
 *       204:
 *         description: Analysis deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Analysis not found
 */
router.get("/:analysisId", auth(), codeAnalysisController.getAnalysis);
router.delete("/:analysisId", auth(), codeAnalysisController.deleteAnalysis);

module.exports = router;
//SWAGGER REMOVED VERSION
// const express = require("express");
// const validate = require("../middleware/validation");
// const { codeAnalysisController } = require("../controllers");
// const analysisValidation = require("../validations/analysis.validation");

// const router = express.Router();

// // Submit code for analysis
// router.post(
//   "/submit",
//   validate(analysisValidation.submitCode),
//   codeAnalysisController.submitCode
// );

// // Get user's analysis history
// router.get("/user/history", codeAnalysisController.getUserAnalyses);

// // Get specific analysis results
// router.get("/:analysisId", codeAnalysisController.getAnalysis);

// // Delete an analysis
// router.delete("/:analysisId", codeAnalysisController.deleteAnalysis);

// module.exports = router;
