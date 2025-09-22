
// src/services/axiosInstance.js
import axios from 'axios';

const api = axios.create({
  // In production, this comes from .env.production
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:2000/api",
  withCredentials: false,
});

// Always read the token from *the same* key used by AuthContext
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // <-- unified key
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
