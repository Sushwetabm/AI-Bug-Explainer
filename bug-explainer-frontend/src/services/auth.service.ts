import axios from "axios";
import type {
  LoginFormData,
  RegisterFormData,
  ResetPasswordData,
} from "@/lib/validations/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const authService = {
  async login(data: LoginFormData) {
    return axios.post(`${API_BASE_URL}/auth/login`, data);
  },

  async register(data: RegisterFormData) {
    return axios.post(`${API_BASE_URL}/auth/register`, data);
  },

  async forgotPassword(email: string) {
    return axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
  },

  async resetPassword(token: string, data: ResetPasswordData) {
    return axios.post(`${API_BASE_URL}/auth/reset-password/${token}`, data);
  },

  async getCurrentUser() {
    return axios.get(`${API_BASE_URL}/user/me`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  },
};
