const mongoose = require("mongoose");
const { toJSON } = require("./plugins");

const bugReportSchema = mongoose.Schema(
  {
    analysis_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CodeAnalysis",
      required: true,
    },
    line_number: {
      type: Number,
      default: null,
    },
    error_message: {
      type: String,
      required: true,
    },
    explanation: {
      type: String,
      required: true,
    },
    fix_suggestion: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// Add plugin that converts mongoose to json
bugReportSchema.plugin(toJSON);

/**
 * @typedef BugReport
 */
const BugReport = mongoose.model("BugReport", bugReportSchema);

module.exports = BugReport;
