import api from "./api.js";

export const authService = {
  async register(userData) {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  async login(correo, contrasena) {
    const response = await api.post("/auth/login", { correo, contrasena });
    const data = response.data;

    if (data.access_token) {
      localStorage.setItem("token", data.access_token);

      // Formato esperado por Sidebar y vistas: { first_name, last_name, email, ... }
      const userObj = {
        first_name: data.cliente?.nombres || data.usuario?.correo?.split("@")[0] || "Usuario",
        last_name: data.cliente?.apellidos || "",
        email: data.usuario?.correo,
        documento: data.cliente?.documento,
        telefono: data.cliente?.telefono,
        direccion: data.cliente?.direccion,
        id_usuario: data.usuario?.id_usuario,
        id_cliente: data.cliente?.id_cliente,
        rol: data.usuario?.rol,
      };

      localStorage.setItem("user", JSON.stringify(userObj));

      if (data.cuenta) {
        localStorage.setItem("active_account", JSON.stringify(data.cuenta));
      }
    }

    return data;
  },

  async getMe() {
    const response = await api.get("/auth/me");
    const data = response.data;

    if (data.usuario) {
      const userObj = {
        first_name: data.cliente?.nombres || data.usuario?.correo?.split("@")[0] || "Usuario",
        last_name: data.cliente?.apellidos || "",
        email: data.usuario?.correo,
        documento: data.cliente?.documento,
        telefono: data.cliente?.telefono,
        direccion: data.cliente?.direccion,
        id_usuario: data.usuario?.id_usuario,
        id_cliente: data.cliente?.id_cliente,
        rol: data.usuario?.rol,
      };
      localStorage.setItem("user", JSON.stringify(userObj));

      if (data.cuenta_principal) {
        localStorage.setItem("active_account", JSON.stringify(data.cuenta_principal));
      }
    }

    return data;
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("active_account");
  },

  getCurrentUser() {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  },

  getActiveAccount() {
    const a = localStorage.getItem("active_account");
    return a ? JSON.parse(a) : null;
  },

  setActiveAccount(account) {
    localStorage.setItem("active_account", JSON.stringify(account));
  },
};

export default authService;
