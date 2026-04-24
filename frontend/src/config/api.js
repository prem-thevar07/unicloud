import axios from "axios";

/* ===============================
   BASE URL (SAFE FALLBACK)
=============================== */

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

/* ===============================
   AXIOS INSTANCE
=============================== */

const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ===============================
   REQUEST INTERCEPTOR (JWT)
=============================== */

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

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

/* ===============================
   RESPONSE INTERCEPTOR (IMPORTANT)
=============================== */

API.interceptors.response.use(
  (response) => response,

  (error) => {
    // 🔥 Handle no response (network issue)
    if (!error.response) {
      console.error("Network Error:", error.message);
      return Promise.reject(error);
    }

    // 🔐 Handle Unauthorized
    if (error.response.status === 401) {
      console.warn("Unauthorized - logging out");

      localStorage.removeItem("token");

      // redirect to login
      window.location.href = "/auth";
    }

    return Promise.reject(error);
  }
);

export default API;