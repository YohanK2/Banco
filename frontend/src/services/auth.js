import api from "./api";

/*
  BANCHOCÓ BANK — sesión
  --------------------------------------------------
  Maneja el inicio de sesión contra el backend y la
  sesión guardada en localStorage. La sesión guarda
  usuario + cliente + cuenta tal como los devuelve
  POST /auth/login.
*/

const SESSION_KEY = "user";
const TOKEN_KEY = "token";

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSession(data) {
  const { access_token, usuario, cliente, cuenta } = data;
  localStorage.setItem(TOKEN_KEY, access_token);
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ ...usuario, cliente, cuenta })
  );
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export async function login(correo, contrasena) {
  const response = await api.post("/auth/login", { correo, contrasena });
  setSession(response.data);
  return response.data;
}

export async function register(formData) {
  const response = await api.post("/auth/register", formData);
  // El registro no hace login automático, solo redirige a login
  return response.data;
}

export async function logoutApi() {
  try {
    await api.post("/auth/logout");
  } catch {
    // El backend aún no expone cierre de sesión; se limpia solo el cliente.
  }
  clearSession();
}

/*
  Refresca los datos del perfil desde el backend usando /auth/me.
  Devuelve la sesión actualizada o null si no hay sesión /
  el backend no responde (en ese caso se conserva la caché).
*/
export async function fetchProfile() {
  try {
    const response = await api.get("/auth/me");
    const { usuario, cliente, cuenta_principal: cuenta, cuentas } = response.data;
    const sessionData = { ...usuario, cliente, cuenta, cuentas };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    return sessionData;
  } catch (error) {
    // Si falla, conservamos los datos en caché.
    return getSession();
  }
}