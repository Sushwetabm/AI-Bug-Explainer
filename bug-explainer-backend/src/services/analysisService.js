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

console.log("🔧 ML Service Config:", {
  url: ML_SERVICE_URL,
  timeout: ML_SERVICE_TIMEOUT,
});

/**
 * Submit code for immediate analysis (synchronous)
 * This is what your frontend expects - immediate results
 */
const submitCode = async (userId, code, language) => {
  console.log("🚀 Service submitCode started:", {
    userId,
    language,
    codeLength: code ? code.length : 0,
    mlServiceUrl: ML_SERVICE_URL,
  });

  try {
    // Validate userId
    if (!userId || !ObjectId.isValid(userId)) {
      console.error("❌ Invalid userId:", userId);
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid user ID");
    }

    // Create analysis record
    console.log("📝 Creating analysis record...");
    const analysis = await CodeAnalysis.create({
      user_id: userId,
      code: code,
      language,
      status: "processing",
    });

    console.log(`✅ Created analysis record: ${analysis._id}`);

    // Call ML service for immediate analysis
    const mlServiceUrl = `${ML_SERVICE_URL}/analysis/submit`;
    console.log(`🤖 Calling ML service: ${mlServiceUrl}`);
    console.log("📤 ML request payload:", {
      codeLength: code.length,
      language,
      timeout: ML_SERVICE_TIMEOUT,
    });

    const mlResponse = await axios.post(
      mlServiceUrl,
      { code, language },
      {
        timeout: ML_SERVICE_TIMEOUT,
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Backend-Service/1.0",
        },
        validateStatus: function (status) {
          return status < 500; // Accept anything less than 500 as success for debugging
        },
      }
    );

    console.log("📥 ML service response:", {
      status: mlResponse.status,
      statusText: mlResponse.statusText,
      dataType: typeof mlResponse.data,
      dataKeys: mlResponse.data ? Object.keys(mlResponse.data) : [],
      hasSuccess: mlResponse.data ? "success" in mlResponse.data : false,
    });

    // Check if ML service returned an error
    if (!mlResponse || mlResponse.status !== 200) {
      const status = mlResponse?.status ?? "N/A";
      const statusText = mlResponse?.statusText ?? "No status text";
      console.error("❌ ML service returned non-200 status:", status);
      throw new ApiError(
        typeof status === "number" ? status : 500,
        `ML service returned status ${status}: ${statusText}`
      );
    }

    if (!mlResponse.data) {
      console.error("❌ ML service returned no data");
      throw new Error("ML service returned no data");
    }

    console.log("✅ ML service responded successfully");

    // Update analysis with results
    console.log("📝 Updating analysis with results...");
    const updatedAnalysis = await updateAnalysisWithResults(
      analysis._id,
      mlResponse.data
    );

    console.log("✅ Analysis updated successfully");

    // Prepare return object
    const returnObject = {
      ...updatedAnalysis.toObject(),
      mlResults: mlResponse.data, // Include ML results for immediate use
    };

    console.log("📤 Returning object structure:", {
      hasAnalysisData: !!updatedAnalysis,
      hasMLResults: !!mlResponse.data,
      mlResultsStructure: {
        success: mlResponse.data.success,
        has_json_output: mlResponse.data.has_json_output,
        corrected_code_length: mlResponse.data.corrected_code
          ? mlResponse.data.corrected_code.length
          : 0,
        issues_count: mlResponse.data.issues
          ? mlResponse.data.issues.length
          : 0,
      },
    });

    return returnObject;
  } catch (mlError) {
    console.error("❌ ML Service error details:", {
      message: mlError.message,
      name: mlError.name,
      code: mlError.code,
      status: mlError.response?.status,
      statusText: mlError.response?.statusText,
      responseData: mlError.response?.data,
      isAxiosError: mlError.isAxiosError,
      stack: mlError.stack,
    });

    // Try to get the analysis record if it was created
    let analysisId;
    try {
      // If we have an analysis ID from earlier, use it
      if (analysis && analysis._id) {
        analysisId = analysis._id;
      } else {
        // Try to find the most recent analysis for this user
        const recentAnalysis = await CodeAnalysis.findOne({
          user_id: userId,
          status: "processing",
        }).sort({ created_at: -1 });

        if (recentAnalysis) {
          analysisId = recentAnalysis._id;
        }
      }
    } catch (findError) {
      console.error("❌ Error finding analysis record:", findError.message);
    }

    // Update analysis status to failed if we have an ID
    if (analysisId) {
      try {
        console.log(`📝 Updating analysis ${analysisId} to failed status`);
        await CodeAnalysis.findByIdAndUpdate(analysisId, {
          status: "failed",
          result: `ML service error: ${mlError.message}`,
        });
      } catch (updateError) {
        console.error(
          "❌ Error updating analysis to failed:",
          updateError.message
        );
      }
    }

    // Create fallback ML results
    const fallbackMLResults = {
      success: false,
      has_json_output: false,
      corrected_code: "",
      issues: [],
      raw_output: `ML service is unavailable: ${mlError.message}. Please try again later.`,
      model_status: "error",
      error: mlError.message,
      error_code: mlError.code,
      error_status: mlError.response?.status,
    };

    console.log("📤 Returning fallback results");

    // Get the failed analysis or create a minimal one
    let failedAnalysis;
    if (analysisId) {
      try {
        failedAnalysis = await CodeAnalysis.findById(analysisId);
      } catch (findError) {
        console.error(
          "❌ Error retrieving failed analysis:",
          findError.message
        );
      }
    }

    return {
      ...(failedAnalysis
        ? failedAnalysis.toObject()
        : {
            _id: "unknown",
            user_id: userId,
            code,
            language,
            status: "failed",
            result: "",
            created_at: new Date(),
          }),
      mlResults: fallbackMLResults,
    };
  }
};

/**
 * Update analysis with ML results and save bug reports
 */
const updateAnalysisWithResults = async (analysisId, mlResults) => {
  try {
    console.log(`📝 Updating analysis ${analysisId} with results...`);
    console.log("📊 ML Results structure:", {
      success: mlResults.success,
      has_json_output: mlResults.has_json_output,
      corrected_code_length: mlResults.corrected_code
        ? mlResults.corrected_code.length
        : 0,
      issues_count: mlResults.issues ? mlResults.issues.length : 0,
    });

    // Prepare update data
    const updateData = {
      status: mlResults.success ? "completed" : "failed",
      result: mlResults.corrected_code || "",
    };

    console.log("📝 Update data:", updateData);

    // Update the analysis record
    const analysis = await CodeAnalysis.findByIdAndUpdate(
      analysisId,
      updateData,
      { new: true }
    );

    if (!analysis) {
      console.error(`❌ Analysis ${analysisId} not found for update`);
      throw new ApiError(httpStatus.NOT_FOUND, "Analysis not found");
    }

    console.log(`✅ Analysis ${analysisId} updated successfully`);

    // Save bug reports if available
    if (mlResults.issues && Array.isArray(mlResults.issues)) {
      console.log(`📝 Saving ${mlResults.issues.length} bug reports...`);

      const bugReports = mlResults.issues.map((issue) => ({
        analysis_id: analysisId,
        line_number: issue.lineNumber || null,
        error_message: issue.type || "Unknown Error",
        explanation: issue.message || "No explanation provided",
        fix_suggestion: issue.suggestion || "No suggestion provided",
      }));

      if (bugReports.length > 0) {
        await BugReport.insertMany(bugReports);
        console.log(`✅ Saved ${bugReports.length} bug reports`);
      }
    } else {
      console.log("ℹ️ No issues to save as bug reports");
    }

    return analysis;
  } catch (error) {
    console.error("❌ Error updating analysis with results:", {
      message: error.message,
      analysisId,
      stack: error.stack,
    });
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
