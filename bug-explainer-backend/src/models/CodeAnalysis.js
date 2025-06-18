const mongoose = require("mongoose");
const { toJSON } = require("./plugins");

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
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
    versionKey: false,
  }
);

// Add plugin that converts mongoose to json
codeAnalysisSchema.plugin(toJSON);

/**
 * @typedef CodeAnalysis
 */
const CodeAnalysis = mongoose.model("CodeAnalysis", codeAnalysisSchema);

module.exports = CodeAnalysis;
