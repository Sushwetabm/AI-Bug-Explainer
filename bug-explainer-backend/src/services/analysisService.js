const httpStatus = require("http-status");
const { ObjectId } = require("mongoose").Types;
const ApiError = require("../utils/ApiError");
const CodeAnalysis = require("../models/CodeAnalysis");
const BugReport = require("../models/BugReport");
const axios = require("axios");

// ML Service configuration
const ML_SERVICE_URL =
  process.env.ML_SERVICE_URL ||
  "https://eventually-streaming-millions-benefits.trycloudflare.com";
const ML_SERVICE_TIMEOUT = parseInt(process.env.ML_SERVICE_TIMEOUT) || 120000;

/**
 * Submit code for immediate analysis (synchronous)
 * This is what your frontend expects - immediate results
 */
const submitCode = async (userId, code, language) => {
  // Create analysis record
  const analysis = await CodeAnalysis.create({
    user_id: userId,
    code: code,
    language,
    status: "processing",
  });

  console.log(`📝 Created analysis record: ${analysis._id}`);

  try {
    // Call ML service for immediate analysis
    console.log(`🤖 Calling ML service: ${ML_SERVICE_URL}/analysis/submit`);

    const mlResponse = await axios.post(
      `${ML_SERVICE_URL}/analysis/submit`,
      { code, language },
      {
        timeout: ML_SERVICE_TIMEOUT,
        headers: { "Content-Type": "application/json" },
      }
    );

    console.log("✅ ML service responded successfully");

    // Update analysis with results
    const updatedAnalysis = await updateAnalysisWithResults(
      analysis._id,
      mlResponse.data
    );

    // Return the analysis record (with ID for future reference)
    return {
      ...updatedAnalysis.toObject(),
      mlResults: mlResponse.data, // Include ML results for immediate use
    };
  } catch (mlError) {
    console.error("❌ ML Service error:", mlError.message);

    // Update analysis status to failed
    await CodeAnalysis.findByIdAndUpdate(analysis._id, {
      status: "failed",
      result: `ML service error: ${mlError.message}`,
    });

    // Still return the analysis record but with error
    const failedAnalysis = await CodeAnalysis.findById(analysis._id);
    return {
      ...failedAnalysis.toObject(),
      mlResults: {
        success: false,
        has_json_output: false,
        corrected_code: "",
        issues: [],
        raw_output: `ML service is unavailable: ${mlError.message}. Please try again later.`,
        model_status: "error",
        error: mlError.message,
      },
    };
  }
};

/**
 * Update analysis with ML results and save bug reports
 */
const updateAnalysisWithResults = async (analysisId, mlResults) => {
  try {
    // Prepare update data
    const updateData = {
      status: mlResults.success ? "completed" : "failed",
      result: mlResults.corrected_code || "",
    };

    // Update the analysis record
    const analysis = await CodeAnalysis.findByIdAndUpdate(
      analysisId,
      updateData,
      { new: true }
    );

    if (!analysis) {
      throw new ApiError(httpStatus.NOT_FOUND, "Analysis not found");
    }

    // Save bug reports if available
    if (mlResults.issues && Array.isArray(mlResults.issues)) {
      const bugReports = mlResults.issues.map((issue) => ({
        analysis_id: analysisId,
        line_number: issue.lineNumber || null,
        error_message: issue.type || "Unknown Error",
        explanation: issue.message || "No explanation provided",
        fix_suggestion: issue.suggestion || "No suggestion provided",
      }));

      if (bugReports.length > 0) {
        await BugReport.insertMany(bugReports);
      }
    }

    return analysis;
  } catch (error) {
    console.error("Error updating analysis with results:", error);
    throw error;
  }
};

/**
 * Legacy method - for backward compatibility with async processing
 * This creates a record and processes it in background
 */
const submitCodeAsync = async (userId, code, language) => {
  const analysis = await CodeAnalysis.create({
    user_id: userId,
    code,
    language,
    status: "pending",
  });

  // Process in background
  setTimeout(async () => {
    await processAnalysis(analysis._id);
  }, 2000);

  return analysis;
};

/**
 * Background processing method (for async workflow)
 */
const processAnalysis = async (analysisId) => {
  try {
    const analysis = await CodeAnalysis.findById(analysisId);
    if (!analysis) return;

    const mlResults = await callMLService(analysis.code, analysis.language);
    await updateAnalysisWithResults(analysisId, mlResults);
  } catch (error) {
    console.error("Background processing error:", error?.message || error);
    await CodeAnalysis.findByIdAndUpdate(analysisId, { status: "failed" });
  }
};

/**
 * Call ML service and format response
 */
const callMLService = async (code, language) => {
  try {
    const response = await axios.post(
      `${ML_SERVICE_URL}/analysis/submit`,
      {
        code,
        language,
      },
      {
        timeout: ML_SERVICE_TIMEOUT,
        headers: { "Content-Type": "application/json" },
      }
    );

    return response.data;
  } catch (error) {
    console.error("ML service call failed:", error.message);
    return {
      success: false,
      has_json_output: false,
      corrected_code: "",
      issues: [],
      raw_output: `ML service failed: ${error.message}`,
      model_status: "error",
    };
  }
};

/**
 * Get analysis by ID
 */
const getAnalysisById = async (analysisId, userId) => {
  const analysis = await CodeAnalysis.findOne({
    _id: analysisId,
    user_id: userId,
  }).populate({
    path: "bug_reports",
    match: { analysis_id: analysisId },
  });

  if (!analysis) {
    throw new ApiError(httpStatus.NOT_FOUND, "Analysis not found");
  }

  return analysis;
};

/**
 * Get user's analyses with pagination
 */
const getUserAnalyses = async (userId, options) => {
  const { page = 1, limit = 10, language, status } = options;
  const skip = (page - 1) * limit;

  const query = { user_id: userId };
  if (language) query.language = language;
  if (status) query.status = status;

  const [analyses, total] = await Promise.all([
    CodeAnalysis.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: "bug_reports",
        options: { sort: { line_number: 1 } },
      }),
    CodeAnalysis.countDocuments(query),
  ]);

  return {
    analyses,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  };
};

/**
 * Delete analysis and associated bug reports
 */
const deleteAnalysis = async (analysisId, userId) => {
  const analysis = await CodeAnalysis.findOne({
    _id: analysisId,
    user_id: userId,
  });

  if (!analysis) {
    throw new ApiError(httpStatus.NOT_FOUND, "Analysis not found");
  }

  // Delete associated bug reports first
  await BugReport.deleteMany({ analysis_id: analysisId });

  // Delete the analysis
  await CodeAnalysis.deleteOne({ _id: analysisId });
};

module.exports = {
  submitCode, // Main method for immediate results
  submitCodeAsync, // Legacy async method
  getAnalysisById,
  getUserAnalyses,
  deleteAnalysis,
  updateAnalysisWithResults, // Export for controller use
};
