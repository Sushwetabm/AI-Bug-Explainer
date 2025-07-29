const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { analysisService } = require("../services");

/**
 * Submit code for immediate analysis (what your frontend expects)
 */
const res.status(error.status || error.statusCode || 500).json(errorResponse);
  try {
    console.log("🚀 Controller started - submitCode");

    // Log request details
    const { code, language } = req.body;
    const userId = req.user?.id;

    console.log("📝 Request details:", {
      userId: userId,
      language: language,
      codeLength: code ? code.length : 0,
      hasUser: !!req.user,
      userKeys: req.user ? Object.keys(req.user) : [],
    });

    // Validate required fields
    if (!code || !language) {
      console.error("❌ Missing required fields:", {
        hasCode: !!code,
        hasLanguage: !!language,
      });
      return res.status(400).json({
        success: false,
        has_json_output: false,
        corrected_code: "",
        issues: [],
        raw_output: "Missing required fields: code and language are required",
        model_status: "error",
      });
    }

    if (!userId) {
      console.error("❌ No user ID found");
      return res.status(401).json({
        success: false,
        has_json_output: false,
        corrected_code: "",
        issues: [],
        raw_output: "Authentication required",
        model_status: "error",
      });
    }

    console.log(
      `🔍 Calling analysisService.submitCode for user: ${userId}, language: ${language}`
    );

    // Call service for immediate analysis
    const result = await analysisService.submitCode(userId, code, language);

    console.log("📊 Service response structure:", {
      hasResult: !!result,
      resultType: typeof result,
      resultKeys: result ? Object.keys(result) : [],
      hasMLResults: !!(result && result.mlResults),
      mlResultsType:
        result && result.mlResults ? typeof result.mlResults : "undefined",
      mlResultsKeys:
        result && result.mlResults ? Object.keys(result.mlResults) : [],
    });

    // Check if we have valid results
    if (!result) {
      console.error("❌ No result returned from service");
      return res.status(500).json({
        success: false,
        has_json_output: false,
        corrected_code: "",
        issues: [],
        raw_output: "Service returned no result",
        model_status: "error",
      });
    }

    // Check for mlResults
    if (!result.mlResults) {
      console.error("❌ No mlResults in service response");
      console.error("Available keys:", Object.keys(result));
      return res.status(500).json({
        success: false,
        has_json_output: false,
        corrected_code: "",
        issues: [],
        raw_output: "Service returned result but no mlResults",
        model_status: "error",
      });
    }

    console.log("✅ Returning mlResults:", {
      success: result.mlResults.success,
      hasJsonOutput: result.mlResults.has_json_output,
      correctedCodeLength: result.mlResults.corrected_code
        ? result.mlResults.corrected_code.length
        : 0,
      issuesCount: result.mlResults.issues ? result.mlResults.issues.length : 0,
      modelStatus: result.mlResults.model_status,
    });

    console.log(`📝 Analysis completed for record: ${result._id || "unknown"}`);

    // Return the ML results directly (what frontend expects)
    res.status(httpStatus.CREATED).json(result.mlResults);
  } catch (error) {
    console.error("❌ Controller error details:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
      code: error.code,
      status: error.status || error.statusCode,
    });

    // Log the full error object
    console.error("❌ Full error object:", error);

    // If it's already an API error, let the error handler deal with it
    if (error instanceof ApiError) {
      console.error("❌ ApiError detected, passing to error handler");
      return next(error);
    }

    // For other errors, return a structured response
    const errorResponse = {
      success: false,
      has_json_output: false,
      corrected_code: "",
      issues: [],
      raw_output: `Analysis failed: ${error.message || "Unknown error"}`,
      model_status: "error",
      error_details: {
        name: error.name,
        message: error.message,
        code: error.code,
      },
    };

    console.error("❌ Returning error response:", errorResponse);

    res.status(500).json(errorResponse);
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
