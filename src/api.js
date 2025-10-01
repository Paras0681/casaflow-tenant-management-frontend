// src/api.js
import axios from "axios";

console.log("API URL:", process.env.REACT_APP_API_URL);
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Request interceptor → attach token
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("access");
    const refreshToken = localStorage.getItem("refresh");

    // console.log("[API REQUEST] Access Token:", accessToken);
    // console.log("[API REQUEST] Refresh Token:", refreshToken);

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor → auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip login/refresh endpoints
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/users/login/") &&
      !originalRequest.url.includes("/users/refresh/")
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh");
        console.log("[API REFRESH] Using Refresh Token:", refreshToken);

        const res = await axios.post("http://127.0.0.1:8000/api/users/refresh/", {
          refresh: refreshToken,
        });

        console.log("[API REFRESH] New Access Token:", res.data.access);

        localStorage.setItem("access", res.data.access);

        // Retry original request with new access token
        originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
        return api(originalRequest);
      } catch (refreshErr) {
        console.error("[API REFRESH ERROR] Refresh token expired or invalid", refreshErr);
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
