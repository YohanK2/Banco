import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para inyectar token JWT automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuesta para manejo de errores comunes
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expirado o no válido
      const isAuthRoute =
        window.location.pathname.includes("/login") ||
        window.location.pathname.includes("/registro") ||
        window.location.pathname === "/inicio";
      if (!isAuthRoute && localStorage.getItem("token")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("active_account");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;