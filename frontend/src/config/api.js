import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ===============================
   REQUEST INTERCEPTOR
=============================== */
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* ===============================
   RESPONSE INTERCEPTOR
=============================== */
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (!err.response) {
      console.error("Network Error:", err.message);
      return Promise.reject(err);
    }

    if (err.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/auth";
    }

    return Promise.reject(err);
  }
);

export default API;