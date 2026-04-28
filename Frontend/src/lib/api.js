import axios from "axios";

/* ======================================================
   BASE URLs
   //5001 was changed to 5000 in student and teacher
====================================================== */
const AUTH_API =
  import.meta.env.VITE_API_AUTH || "http://localhost:5000/api/auth";

const STUDENT_API =
  import.meta.env.VITE_API_STUDENT || "http://localhost:5000/api/student";

const TEACHER_API =
  import.meta.env.VITE_API_TEACHER || "http://localhost:5000/api/teacher";

/* ======================================================
   AXIOS INSTANCES
====================================================== */
export const authAPI = axios.create({
  baseURL: AUTH_API,
});

export const studentAPI = axios.create({
  baseURL: STUDENT_API,
});

export const teacherAPI = axios.create({
  baseURL: TEACHER_API,
});

/* ======================================================
   SINGLE SOURCE OF TOKEN
====================================================== */
const getAccessToken = () => localStorage.getItem("accessToken");

/* ======================================================
   AUTO ATTACH TOKEN (INTERCEPTORS)
====================================================== */
const attachToken = (config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

authAPI.interceptors.request.use(attachToken);
studentAPI.interceptors.request.use(attachToken);
teacherAPI.interceptors.request.use(attachToken);

/* ======================================================
   LOGOUT HELPER
====================================================== */
export const clearAuth = () => {
  localStorage.removeItem("accessToken");
};

export const joinCommunityDirect = (communityId) => {
  return studentAPI.post(`/communities/${communityId}/join`);
};
