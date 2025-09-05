import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

// Add access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle token refresh on 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      error.response &&
      error.response.status === 401 &&
      error.response.data.code === "token_not_valid"
    ) {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const res = await axios.post(
            "http://127.0.0.1:8000/api/users/token/refresh/",
            { refresh: refreshToken }
          );
          localStorage.setItem("access_token", res.data.access);
          error.config.headers.Authorization = `Bearer ${res.data.access}`;
          return axios(error.config); // retry original request
        } catch (refreshError) {
          console.error("Refresh token failed", refreshError);
          // optionally redirect to login
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
