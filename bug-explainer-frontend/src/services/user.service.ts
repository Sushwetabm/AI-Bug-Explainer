import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const userService = {
  async updateProfile(data: {
    name: string;
    email: string;
    password?: string;
  }) {
    return axios.put(`${API_BASE_URL}/user/update`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  },
};
