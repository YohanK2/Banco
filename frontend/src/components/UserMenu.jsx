import { useEffect } from "react";
import { Bell, Settings, UserRound } from "lucide-react";

/*
  BANCHOCÓ BANK — utilidades del menú de usuario
  Compartidas entre el Sidebar y el Topbar: lista de
  opciones (Mi perfil / Configuraciones / Notificaciones)
  y helpers para mostrar nombre e iniciales reales.
*/

export const USER_MENU_ITEMS = [
  { id: "perfil", label: "Mi perfil", to: "/perfil", icon: UserRound },
  { id: "ajustes", label: "Configuraciones", to: "/ajustes", icon: Settings },
  { id: "notificaciones", label: "Notificaciones", action: "notifications", icon: Bell },
];

export function useOutsideClose(ref, onClose) {
  useEffect(() => {
    if (!onClose) return undefined;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [ref, onClose]);
}

export function getFullName(profile) {
  const cliente = profile?.cliente;
  const nombre = [cliente?.nombres, cliente?.apellidos].filter(Boolean).join(" ");
  return (
    nombre ||
    profile?.first_name ||
    profile?.correo?.split("@")[0] ||
    "Usuario"
  );
}

export function getFirstName(profile) {
  return getFullName(profile).split(" ")[0] || "Usuario";
}

export function getInitials(profile) {
  if (!profile) return "U";
  const cliente = profile.cliente;
  const words = `${cliente?.nombres || profile.first_name || ""} ${
    cliente?.apellidos || profile.last_name || ""
  }`
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) {
    return (profile.correo?.[0] || "U").toUpperCase();
  }
  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function getEmail(profile) {
  return profile?.correo || profile?.email || "";
}
