import axios from "axios";

/*
 * Central Axios client for ESM application
 *
 * Frontend:
 *   http://localhost:5173
 *
 * Backend:
 *   http://localhost:8081
 *
 * Vite proxy forwards /api -> Spring Boot
 */

const axiosApi = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

/*
 * REQUEST INTERCEPTOR
 *
 * Adds JWT token to every protected API request.
 */
axiosApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    console.log(
      "API Request:",
      config.method?.toUpperCase(),
      config.url
    );

    console.log("JWT exists:", !!token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

/*
 * RESPONSE INTERCEPTOR
 *
 * Handles:
 * 401 = JWT missing/expired/invalid
 * 403 = authenticated but Spring Security rejected permission
 */
axiosApi.interceptors.response.use(
  (response) => {
    console.log(
      "API Response:",
      response.status,
      response.config.method?.toUpperCase(),
      response.config.url
    );

    return response;
  },

  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;

    console.error(
      "API Error:",
      status,
      error.config?.method?.toUpperCase(),
      url
    );

    if (status === 401) {
      console.warn("Unauthorized - removing JWT");

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");

      // Avoid redirecting repeatedly if already on login page
      if (
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/admin/login"
      ) {
        window.location.href = "/login";
      }
    }

    if (status === 403) {
      console.warn(
        "403 Forbidden - JWT was received, but Spring Security denied access."
      );
    }

    return Promise.reject(error);
  }
);

export default axiosApi;