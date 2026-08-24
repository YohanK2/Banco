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

export async function logoutApi() {
  try {
    await api.post("/auth/logout");
  } catch {
    // El backend aún no expone cierre de sesión; se limpia solo el cliente.
  }
  clearSession();
}

/*
  Refresca los datos del perfil desde el backend.
  Devuelve la sesión actualizada o null si no hay sesión /
  el backend no responde (en ese caso se conserva la caché).
*/
export async function fetchProfile() {
  const session = getSession();
  if (!session?.id_usuario) return null;

  let usuario = session;
  let cliente = session.cliente || null;

  try {
    const userResponse = await api.get(`/users/${session.id_usuario}`);
    usuario = { ...session, ...userResponse.data };
  } catch {
    // Si falla, conservamos los datos en caché.
  }

  if (cliente?.id_cliente) {
    try {
      const clientResponse = await api.get(`/clients/${cliente.id_cliente}`);
      cliente = { ...cliente, ...clientResponse.data };
    } catch {
      // Ídem.
    }
  }

  const updated = { ...usuario, cliente };
  localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  return updated;
}
