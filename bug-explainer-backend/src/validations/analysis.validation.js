const Joi = require("joi");

const submitCode = {
  body: Joi.object().keys({
    code: Joi.string().required(),
    language: Joi.string()
      .valid(
        "javascript",
        "python",
        "java",
        "cpp",
        "c",
        "php",
        "typescript",
        "go",
        "rust"
      )
      .required(),
  }),
};

module.exports = {
  submitCode,
};
