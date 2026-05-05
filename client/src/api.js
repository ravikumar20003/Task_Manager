import axios from "axios";

const apiBaseUrl = import.meta.env.PROD
  ? "/api"
  : import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  timeout: 8000,
});

export const getApiError = (error) =>
  error.response?.data?.message || error.message || "Something went wrong. Please try again.";

export default api;
