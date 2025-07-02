import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const analysisService = {
  async analyzeCode(code: string, language: string) {
    return axios.post(
      `${API_BASE_URL}/analysis`,
      { code, language },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
  },

  async getAnalysisHistory() {
    return axios.get(`${API_BASE_URL}/analysis/history`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  },
};
