const httpStatus = require("http-status").default;
const ApiError = require("../utils/ApiError");
const { analysisService } = require("../services");

const submitCode = async (req, res, next) => {
  try {
    const { code, language } = req.body;
    const analysis = await analysisService.submitCode(
      req.user.id,
      code,
      language
    );
    res.status(httpStatus.CREATED).json({
      success: true,
      data: {
        analysisId: analysis.id,
      },
    });
  } catch (error) {
    next(error);
  }
};

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

const deleteAnalysis = async (req, res, next) => {
  try {
    await analysisService.deleteAnalysis(req.params.analysisId, req.user.id);
    res.status(httpStatus.NO_CONTENT).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitCode,
  getAnalysis,
  getUserAnalyses,
  deleteAnalysis,
};
