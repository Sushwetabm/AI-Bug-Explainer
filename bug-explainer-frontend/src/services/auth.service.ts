import axios from "axios";
import type {
  LoginFormData,
  RegisterFormData,
  ResetPasswordData,
} from "@/lib/validations/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const authService = {
  async login(data: LoginFormData) {
    return axios.post(`${API_BASE_URL}/auth/login`, data, {
      validateStatus: (status) => status < 500, // Don't throw on 4xx errors
    });
  },

  async register(data: RegisterFormData) {
    return axios.post(
      `${API_BASE_URL}/auth/register`,
      {
        name: data.name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      },
      {
        validateStatus: (status) => status < 500,
      }
    );
  },

  async forgotPassword(email: string) {
    return axios.post(
      `${API_BASE_URL}/auth/forgot-password`,
      { email },
      {
        validateStatus: (status) => status < 500,
      }
    );
  },

  async resetPassword(token: string, data: ResetPasswordData) {
    return axios.post(`${API_BASE_URL}/auth/reset-password/${token}`, data, {
      validateStatus: (status) => status < 500,
    });
  },

  async getCurrentUser() {
    return axios.get(`${API_BASE_URL}/user/me`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      validateStatus: (status) => status < 500,
    });
  },
  async validateToken() {
    return axios.get(`${API_BASE_URL}/auth/validate`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      validateStatus: (status) => status < 500,
    });
  },
};
