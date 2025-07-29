const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { analysisService } = require("../services");

/**
 * Submit code for immediate analysis (what your frontend expects)
 */
const submitCode = async (req, res, next) => {
  try {
    const { code, language } = req.body;
    const userId = req.user.id;
    console.log("🔍 Controller received:", {
      userId,
      language,
      codeLength: code.length,
    });
    const result = await analysisService.submitCode(userId, code, language);
    console.log("📝 Service returned:", {
      hasResult: !!result,
      hasMLResults: !!result?.mlResults,
      resultKeys: result ? Object.keys(result) : [],
      mlResultsKeys: result?.mlResults ? Object.keys(result.mlResults) : [],
    });
    // Return ML results directly (what frontend expects)
    if (result && result.mlResults) {
      res.status(httpStatus.CREATED).json(result.mlResults);
    } else {
      // Fallback if mlResults is missing
      res.status(httpStatus.CREATED).json({
        success: false,
        has_json_output: false,
        corrected_code: "",
        issues: [],
        raw_output: "Analysis failed to return results",
        model_status: "error",
      });
    }
  } catch (error) {
    console.error("❌ Controller error:", error);
    console.error("❌ Controller error details:", {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name,
    });
    next(error);
  }
};

/**
 * Submit code for async processing (legacy/alternative method)
 */
const submitCodeAsync = async (req, res, next) => {
  try {
    const { code, language } = req.body;
    const userId = req.user.id;

    const analysis = await analysisService.submitCodeAsync(
      userId,
      code,
      language
    );

    res.status(httpStatus.CREATED).json({
      success: true,
      data: {
        analysisId: analysis.id,
        status: analysis.status,
        message: "Code submitted for analysis. Check back later for results.",
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get analysis by ID
 */
const getAnalysis = async (req, res, next) => {
  try {
    const analysis = await analysisService.getAnalysisById(
      req.params.analysisId,
      req.user.id
    );

    res.json({
      success: true,
      data: {
        analysis,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's analysis history
 */
const getUserAnalyses = async (req, res, next) => {
  try {
    const result = await analysisService.getUserAnalyses(
      req.user.id,
      req.query
    );

    res.json({
      success: true,
      data: {
        analyses: result.analyses,
        pagination: result.pagination,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete analysis
 */
const deleteAnalysis = async (req, res, next) => {
  try {
    await analysisService.deleteAnalysis(req.params.analysisId, req.user.id);
    res.status(httpStatus.NO_CONTENT).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitCode, // Main method for immediate results
  submitCodeAsync, // Alternative async method
  getAnalysis,
  getUserAnalyses,
  deleteAnalysis,
};
