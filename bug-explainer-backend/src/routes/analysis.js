const express = require("express");
const validate = require("../middleware/validation");
const { codeAnalysisController } = require("../controllers");
const analysisValidation = require("../validations/analysis.validation");

const router = express.Router();

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
 */
router.post(
  "/submit",
  validate(analysisValidation.submitCode),
  codeAnalysisController.submitCode
);

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
 *     responses:
 *       200:
 *         description: Analysis results
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Analysis not found
 */
router.get("/:analysisId", codeAnalysisController.getAnalysis);

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
router.get("/user/history", codeAnalysisController.getUserAnalyses);

/**
 * @swagger
 * /analysis/{analysisId}:
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
 *     responses:
 *       204:
 *         description: Analysis deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Analysis not found
 */
router.delete("/:analysisId", codeAnalysisController.deleteAnalysis);

module.exports = router;
