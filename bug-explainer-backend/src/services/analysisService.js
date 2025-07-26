// const httpStatus = require("http-status").default;
// const { ObjectId } = require("mongoose").Types;
// const ApiError = require("../utils/ApiError");
// const CodeAnalysis = require("../models/CodeAnalysis");
// const BugReport = require("../models/BugReport");

// const submitCode = async (userId, code, language) => {
//   const analysis = await CodeAnalysis.create({
//     user_id: userId,
//     code,
//     language,
//     status: "pending",
//   });

//   // In a real application, this would be sent to a queue for processing
//   // Here we'll simulate processing after a delay
//   setTimeout(async () => {
//     await processAnalysis(analysis._id);
//   }, 5000);

//   return analysis;
// };

// const processAnalysis = async (analysisId) => {
//   try {
//     const analysis = await CodeAnalysis.findById(analysisId);
//     if (!analysis) return;

//     // Simulate ML service processing
//     const bugs = await analyzeCodeWithML(analysis.code, analysis.language);

//     await BugReport.insertMany(
//       bugs.map((bug) => ({
//         analysis_id: analysisId,
//         ...bug,
//       }))
//     );

//     analysis.status = "completed";
//     await analysis.save();
//   } catch (error) {
//     await CodeAnalysis.findByIdAndUpdate(analysisId, { status: "failed" });
//   }
// };

// const axios = require("axios");
// const ML_SERVICE_URL = process.env.ML_SERVICE_URL;

// const analyzeCodeWithML = async (code, language) => {
//   try {
//     const response = await axios.post(ML_SERVICE_URL, {
//       code,
//       language,
//     });

//     return response.data.bugs || [];
//   } catch (error) {
//     console.error("Error calling ML microservice:", error.message);
//     return [
//       {
//         line_number: 0,
//         error_message: "ML service failed",
//         explanation: "Could not get response from ML microservice",
//         fix_suggestion: "Check ML service logs",
//       },
//     ];
//   }
// };

// const getAnalysisById = async (analysisId, userId) => {
//   const analysis = await CodeAnalysis.findOne({
//     _id: analysisId,
//     user_id: userId,
//   }).populate("bugs");

//   if (!analysis) {
//     throw new ApiError(httpStatus.NOT_FOUND, "Analysis not found");
//   }

//   return analysis;
// };

// const getUserAnalyses = async (userId, options) => {
//   const { page = 1, limit = 10, language, status } = options;
//   const skip = (page - 1) * limit;

//   const query = { user_id: userId };
//   if (language) query.language = language;
//   if (status) query.status = status;

//   const [analyses, total] = await Promise.all([
//     CodeAnalysis.find(query).sort({ created_at: -1 }).skip(skip).limit(limit),
//     CodeAnalysis.countDocuments(query),
//   ]);

//   return {
//     analyses,
//     pagination: {
//       page,
//       limit,
//       total,
//       totalPages: Math.ceil(total / limit),
//     },
//   };
// };

// const deleteAnalysis = async (analysisId, userId) => {
//   const analysis = await CodeAnalysis.findOneAndDelete({
//     _id: analysisId,
//     user_id: userId,
//   });

//   if (!analysis) {
//     throw new ApiError(httpStatus.NOT_FOUND, "Analysis not found");
//   }

//   await BugReport.deleteMany({ analysis_id: analysisId });
// };

// module.exports = {
//   submitCode,
//   getAnalysisById,
//   getUserAnalyses,
//   deleteAnalysis,
// };
const httpStatus = require("http-status");
const { ObjectId } = require("mongoose").Types;
const ApiError = require("../utils/ApiError");
const CodeAnalysis = require("../models/CodeAnalysis");
const BugReport = require("../models/BugReport");
const axios = require("axios");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL;

const submitCode = async (userId, code, language) => {
  const analysis = await CodeAnalysis.create({
    user_id: userId,
    code,
    language,
    status: "pending",
  });

  setTimeout(async () => {
    await processAnalysis(analysis._id);
  }, 2000); // Simulate async processing

  return analysis;
};

const processAnalysis = async (analysisId) => {
  try {
    const analysis = await CodeAnalysis.findById(analysisId);
    if (!analysis) return;

    const { bugs, corrected_code } = await analyzeCodeWithML(
      analysis.code,
      analysis.language
    );

    await BugReport.insertMany(
      bugs.map((bug) => ({
        analysis_id: analysisId,
        ...bug,
      }))
    );

    analysis.corrected_code = corrected_code;
    analysis.status = "completed";
    await analysis.save();
  } catch (error) {
    console.error("ML Service Error:", error?.message || error);
    await CodeAnalysis.findByIdAndUpdate(analysisId, { status: "failed" });
  }
};

const analyzeCodeWithML = async (code, language) => {
  try {
    const response = await axios.post(ML_SERVICE_URL, { code, language });

    const { bugs, corrected_code } = response.data;

    return {
      bugs: bugs.map((bug, idx) => ({
        line_number: bug.line_number || 0,
        error_message: bug.error_message || "Unspecified error",
        explanation: bug.explanation || "",
        fix_suggestion: bug.fix_suggestion || "",
      })),
      corrected_code: corrected_code || "",
    };
  } catch (error) {
    return {
      bugs: [
        {
          line_number: 0,
          error_message: "ML service failed",
          explanation: "Could not get response from ML microservice",
          fix_suggestion: "Check ML service logs",
        },
      ],
      corrected_code: "",
    };
  }
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

