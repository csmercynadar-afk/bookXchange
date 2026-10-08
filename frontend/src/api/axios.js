import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // send/receive the httpOnly refresh-token cookie
});

// Attach token to every request (unless the caller already set its own, e.g. Clerk exchange)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh expired access tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url || "";

    // Never try to "refresh" for login/signup/refresh/clerk calls — a wrong password is a normal 401
    const isAuthCall = /\/auth\/(login|signup|refresh|clerk|forgot-password|verify-otp|reset-password)/.test(url);
    const hadToken = !!localStorage.getItem("token");

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthCall && hadToken) {
      originalRequest._retry = true;
      try {
        const { data } = await api.post("/auth/refresh");
        localStorage.setItem("token", data.token);
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
