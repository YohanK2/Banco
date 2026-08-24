import { useEffect, useState } from "react";
import { fetchProfile, getSession } from "../services/auth";

/*
  BANCHOCÓ BANK — perfil en sesión
  Espera los datos del backend (GET /users/{id} y
  GET /clients/{id}) y expone el perfil actualizado.
  Mientras carga, `loading` es true para mostrar skeletons.
*/
export function useProfile() {
  const [profile, setProfile] = useState(() => getSession());
  const [loading, setLoading] = useState(Boolean(getSession()));

  useEffect(() => {
    let cancelled = false;
    if (!getSession()) {
      setLoading(false);
      return undefined;
    }
    fetchProfile()
      .then((updated) => {
        if (!cancelled && updated) setProfile(updated);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { profile, loading };
}
