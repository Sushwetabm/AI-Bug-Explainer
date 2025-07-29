const mongoose = require("mongoose");
const toJSON = require("./plugins/toJSON");

const codeAnalysisSchema = mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
      enum: [
        "javascript",
        "python",
        "java",
        "cpp",
        "c",
        "php",
        "typescript",
        "go",
        "rust",
      ],
    },
    result: {
      type: String,
      default: "", // This will store corrected_code
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    // Additional fields for ML results (optional, for extended functionality)
    raw_output: {
      type: String,
      default: "",
    },
    has_json_output: {
      type: Boolean,
      default: false,
    },
    model_status: {
      type: String,
      default: "unknown",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
    versionKey: false,
  }
);

// Virtual for bug reports
codeAnalysisSchema.virtual("bugs", {
  ref: "BugReport",
  localField: "_id",
  foreignField: "analysis_id",
});

// Alternative virtual name for consistency
codeAnalysisSchema.virtual("bug_reports", {
  ref: "BugReport",
  localField: "_id",
  foreignField: "analysis_id",
});

// Ensure virtual fields are serialized
codeAnalysisSchema.set("toJSON", { virtuals: true });
codeAnalysisSchema.set("toObject", { virtuals: true });

// Add plugin that converts mongoose to json
codeAnalysisSchema.plugin(toJSON);

// Index for efficient queries
codeAnalysisSchema.index({ user_id: 1, created_at: -1 });
codeAnalysisSchema.index({ user_id: 1, language: 1 });
codeAnalysisSchema.index({ user_id: 1, status: 1 });

/**
 * @typedef CodeAnalysis
 */
const CodeAnalysis =
  mongoose.models.CodeAnalysis ||
  mongoose.model("CodeAnalysis", codeAnalysisSchema);

module.exports = CodeAnalysis;
