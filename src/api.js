import axios from "axios";
import { getApiUrl } from "./config";

let apiInstance = null;

export async function getApi() {
  if (!apiInstance) {
    const baseURL = await getApiUrl(); // Get backend URL at runtime

    apiInstance = axios.create({
      baseURL,
    });

    // Request interceptor → attach token
    apiInstance.interceptors.request.use(
      (config) => {
        const accessToken = localStorage.getItem("access");
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor → auto-refresh on 401
    apiInstance.interceptors.response.use(
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
            const res = await axios.post(`${await getApiUrl()}/users/refresh/`, {
              refresh: refreshToken,
            });
            localStorage.setItem("access", res.data.access);
            originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
            return apiInstance(originalRequest);
          } catch (refreshErr) {
            localStorage.clear();
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }
    );
  }

  return apiInstance;
}
