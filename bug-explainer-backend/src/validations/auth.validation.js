const Joi = require("joi");

// Common patterns for messages
const emailMessages = {
  "string.base": "Email must be a string",
  "string.empty": "Email cannot be empty",
  "any.required": "Email is required",
  "string.email": "Email must be a valid email address",
};

const passwordMessages = {
  "string.base": "Password must be a string",
  "string.empty": "Password cannot be empty",
  "any.required": "Password is required",
  "string.min": "Password must be at least {#limit} characters long",
};

const strongPassword = Joi.string()
  .pattern(
    new RegExp(
      "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=[\\]{};':\"\\\\|,.<>/?]).{8,}$"
    )
  )
  .required()
  .messages({
    ...passwordMessages,
    "string.pattern.base":
      "Password must include uppercase, lowercase, number, and special character",
  });

const register = {
  body: Joi.object().keys({
    email: Joi.string().email().required().messages(emailMessages),
    password: strongPassword,
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().email().required().messages(emailMessages),
    password: strongPassword,
  }),
};

module.exports = {
  register,
  login,
};
