const httpStatus = require("http-status").default;
const { ObjectId } = require("mongoose").Types;
const ApiError = require("../utils/ApiError");
const CodeAnalysis = require("../models/CodeAnalysis");
const BugReport = require("../models/BugReport");

const submitCode = async (userId, code, language) => {
  const analysis = await CodeAnalysis.create({
    user_id: userId,
    code,
    language,
    status: "pending",
  });

  // In a real application, this would be sent to a queue for processing
  // Here we'll simulate processing after a delay
  setTimeout(async () => {
    await processAnalysis(analysis._id);
  }, 5000);

  return analysis;
};

const processAnalysis = async (analysisId) => {
  try {
    const analysis = await CodeAnalysis.findById(analysisId);
    if (!analysis) return;

    // Simulate ML service processing
    const bugs = await analyzeCodeWithML(analysis.code, analysis.language);

    await BugReport.insertMany(
      bugs.map((bug) => ({
        analysis_id: analysisId,
        ...bug,
      }))
    );

    analysis.status = "completed";
    await analysis.save();
  } catch (error) {
    await CodeAnalysis.findByIdAndUpdate(analysisId, { status: "failed" });
  }
};

const analyzeCodeWithML = async (code, language) => {
  // This is a mock implementation - in a real app this would call your ML service
  return [
    {
      line_number: 1,
      error_message: "Undefined variable",
      explanation: "The variable was used before it was defined",
      fix_suggestion: "Declare the variable before using it",
    },
  ];
};

const getAnalysisById = async (analysisId, userId) => {
  const analysis = await CodeAnalysis.findOne({
    _id: analysisId,
    user_id: userId,
  }).populate("bugs");

  if (!analysis) {
    throw new ApiError(httpStatus.NOT_FOUND, "Analysis not found");
  }

  return analysis;
};

const getUserAnalyses = async (userId, options) => {
  const { page = 1, limit = 10, language, status } = options;
  const skip = (page - 1) * limit;

  const query = { user_id: userId };
  if (language) query.language = language;
  if (status) query.status = status;

  const [analyses, total] = await Promise.all([
    CodeAnalysis.find(query).sort({ created_at: -1 }).skip(skip).limit(limit),
    CodeAnalysis.countDocuments(query),
  ]);

  return {
    analyses,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const deleteAnalysis = async (analysisId, userId) => {
  const analysis = await CodeAnalysis.findOneAndDelete({
    _id: analysisId,
    user_id: userId,
  });

  if (!analysis) {
    throw new ApiError(httpStatus.NOT_FOUND, "Analysis not found");
  }

  await BugReport.deleteMany({ analysis_id: analysisId });
};

module.exports = {
  submitCode,
  getAnalysisById,
  getUserAnalyses,
  deleteAnalysis,
};
