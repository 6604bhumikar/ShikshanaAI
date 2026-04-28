import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_ADMIN?.trim() ||
  "http://localhost:5000/api/admin";

const adminAPI = axios.create({
  baseURL: BASE_URL,
  withCredentials: false, // ✅ explicit (prevents CORS/session confusion)
});

/* ============================
   🔐 ATTACH ADMIN TOKEN
============================ */
adminAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ============================
   🚨 GLOBAL 401 HANDLER (OPTIONAL BUT SAFE)
============================ */
adminAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      console.warn("Admin unauthorized – token missing or expired");
      // Optional redirect:
      // window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);

export default adminAPI;
