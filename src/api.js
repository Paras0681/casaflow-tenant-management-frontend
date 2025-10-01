import axios from "axios";

const baseURL =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api/";

console.log("✅ API BaseURL:", baseURL);

const api = axios.create({ baseURL });

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("access");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

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

        // ✅ use api instance here (no hardcoded localhost)
        const res = await api.post("/users/refresh/", { refresh: refreshToken });

        console.log("[API REFRESH] New Access Token:", res.data.access);

        localStorage.setItem("access", res.data.access);

        // Retry with new token
        originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
        return api(originalRequest);
      } catch (refreshErr) {
        console.error("[API REFRESH ERROR] Refresh token expired or invalid", refreshErr);
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
