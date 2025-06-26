import { z } from "zod";

// Regex for strong password (same as backend Joi)
const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

const emailValidation = z
  .string()
  .nonempty("Email cannot be empty")
  .email("Email must be a valid email address");

const passwordValidation = z
  .string()
  .nonempty("Password cannot be empty")
  .min(8, "Password must be at least 8 characters long")
  .regex(strongPasswordRegex, {
    message:
      "Password must include uppercase, lowercase, number, and special character",
  });

// Login schema
export const loginSchema = z.object({
  email: emailValidation,
  password: passwordValidation,
});

// Register schema
export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: emailValidation,
    password: passwordValidation,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: emailValidation,
});

// Reset password schema
export const resetPasswordSchema = z
  .object({
    password: passwordValidation,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Types
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
