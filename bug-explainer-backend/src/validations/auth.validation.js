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

const nameMessages = {
  "string.base": "Name must be a string",
  "string.empty": "Name cannot be empty",
  "any.required": "Name is required",
  "string.min": "Name must be at least {#limit} characters long",
};

const strongPassword = Joi.string()
  .min(8)
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
    name: Joi.string().min(2).required().messages(nameMessages),
    email: Joi.string().email().required().messages(emailMessages),
    password: strongPassword,
    confirmPassword: Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .messages({
        "any.only": "Passwords must match",
        "any.required": "Confirm Password is required",
      }),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().email().required().messages(emailMessages),
    password: Joi.string().required().messages(passwordMessages),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required().messages(emailMessages),
  }),
};

const resetPassword = {
  body: Joi.object().keys({
    token: Joi.string().required(),
    password: strongPassword,
  }),
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
};
