import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// API URL
const API = import.meta.env.VITE_API_AUTH || "http://localhost:5000/api/auth";

// localStorage key
const TOKEN_KEY = "accessToken";

const normalizeRole = (role) => String(role || "").trim().toLowerCase();

const dashboardRouteFor = (authUser) => {
  const role = normalizeRole(authUser?.role);

  if (role === "admin") return "/admin/dashboard";
  if (role === "teacher") return "/teacher/dashboard";
  if (role === "student") return "/dashboard";

  return "/login";
};

const normalizeUser = (authUser) =>
  authUser ? { ...authUser, role: normalizeRole(authUser.role) } : null;

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ===================== AXIOS INTERCEPTOR ===================== */
  useEffect(() => {
    const interceptor = axios.interceptors.request.use((config) => {

      const token = localStorage.getItem(TOKEN_KEY);

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    });

    return () => axios.interceptors.request.eject(interceptor);

  }, []);

  /* ===================== LOAD USER FROM STORAGE ===================== */
  useEffect(() => {

    const savedUser = localStorage.getItem("user");

    if (savedUser && savedUser !== "undefined") {
      try {
        setUser(normalizeUser(JSON.parse(savedUser)));
      } catch {
        localStorage.removeItem("user");
      }
    }

    setLoading(false);

  }, []);

  /* ===================== LOGIN ===================== */
  const login = async (email, password) => {

    try {
      const res = await axios.post(
        `${API}/login`,
        { email, password },
        { withCredentials: true }
      );

      console.log("Login response:", res.data);

      // 🔥 FIXED TOKEN LINE
      const accessToken = res.data.token || res.data.accessToken;
      const user = normalizeUser(res.data.user);

      if (!accessToken || !user) {
        throw new Error("Invalid auth response");
      }

      localStorage.setItem(TOKEN_KEY, accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);

      return { accessToken, user };

    } catch (error) {

      console.error("Login error:", error);
      throw error;

    }

  };

  /* ===================== REGISTER ===================== */
  //const register = async (name, email, password, role) => {

    //try {

      //const res = await axios.post(
        //`${API}/register`,
        //{ name, email, password, role },
        //{ withCredentials: true }
      //);

      //console.log("Register response:", res.data);

      // 🔥 FIXED TOKEN LINE
      //const accessToken = res.data.token || res.data.accessToken;
      //const user = res.data.user;

     

      //if (!accessToken || !user) {
        //throw new Error("Invalid auth response");
      //}

      //localStorage.setItem(TOKEN_KEY, accessToken);
      //localStorage.setItem("user", JSON.stringify(user));

      //setUser(user);

      //return { accessToken, user };

    //} catch (error) {

      //console.error("Registration error:", error);
      //throw error;

    //}

  //};
  
    /* ===================== REGISTER ===================== */
const register = async (name, email, password, role) => {
  try {

    // 🔹 Send signup data to backend API
    const res = await axios.post(
      `${API}/register`,
      { name, email, password, role },
      { withCredentials: true }
    );

    console.log("Register response:", res.data);

    // 🔹 Get token + user from backend response
    const accessToken = res.data.token || res.data.accessToken;
    const user = normalizeUser(res.data.user);

    // 🔹 If missing → throw error
    if (!accessToken || !user) {
      throw new Error("Invalid auth response");
    };

    // 🔹 Store token in localStorage
    localStorage.setItem(TOKEN_KEY, accessToken);

    // 🔹 Store user in localStorage
    localStorage.setItem("user", JSON.stringify(user));

    // 🔹 Update state
    setUser(user);

    // 🔹 Return response
    return { accessToken, user };

  } catch (error) {

    console.error("Registration error:", error);
    throw error;

  }
};

  /* ===================== LOGOUT ===================== */
  const logout = () => {

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("user");

    setUser(null);

  };

  /* ===================== ROLE CHECK ===================== */
  const isStudent = user?.role === "student";
  const isTeacher = user?.role === "teacher";
  const isAdmin = user?.role === "admin";

  /* ===================== DASHBOARD ROUTE ===================== */
  const getDashboardRoute = () => {

    return dashboardRouteFor(user);

  };

  return (

    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isStudent,
        isTeacher,
        isAdmin,
        getDashboardRoute,
        dashboardRouteFor
      }}
    >

      {children}

    </AuthContext.Provider>

  );

};
