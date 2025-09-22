import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../services/axiosInstance";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");

  useEffect(() => {
    if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
    else delete api.defaults.headers.common.Authorization;
  }, [token]);

  const login = async ({ login, password }) => {
    const { data } = await api.post("/auth/login", { login, password });
    setToken(data.token); localStorage.setItem("token", data.token);
    setUser(data.employee); localStorage.setItem("user", JSON.stringify(data.employee));
  };

  const logout = () => {
    setUser(null); setToken(""); localStorage.removeItem("user"); localStorage.removeItem("token");
  };

  const forgotPassword = async ({ login }) => api.post("/auth/forgot-password", { login });
  const resetPassword = async ({ login, otp, newPassword }) =>
    api.post("/auth/reset-password", { login, otp, newPassword });

  return (
    <AuthCtx.Provider value={{ user, token, login, logout, forgotPassword, resetPassword }}>
      {children}
    </AuthCtx.Provider>
  );
}
