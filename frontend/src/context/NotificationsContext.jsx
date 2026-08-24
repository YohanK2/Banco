import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import api from "../services/api";
import { getSession } from "../services/auth";

/*
  BANCHOCÓ BANK — notificaciones globales
  --------------------------------------------------
  Al montar, si hay sesión con cuenta, consulta las
  transacciones del backend (/transactions/account/{id})
  y las convierte en notificaciones ("Recibiste dinero",
  "Enviaste dinero", etc.). Las acciones hechas en la app
  (transferencias, retiros) se agregan con pushNotification.
*/

const SEEN_KEY = "banchoco_notifications_seen_at";

export const NOTIF_TYPES = {
  MONEY_IN: "money_in",
  MONEY_OUT: "money_out",
  INFO: "info",
};

const MESSAGES_DEMO = [
  {
    id: "m1",
    from: "Soporte Banchocó",
    subject: "Bienvenido a tu banco digital",
    preview: "Gracias por abrir tu cuenta. Aquí tienes algunos consejos para empezar.",
    date: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    read: false,
  },
  {
    id: "m2",
    from: "Seguridad",
    subject: "Tips para proteger tu cuenta",
    preview: "Nunca compartas tu clave dinámica. Banchocó jamás la solicita.",
    date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    read: true,
  },
];

const NotificationsContext = createContext(null);

const formatCOP = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

function mapTransaction(tx, accountId, index) {
  const monto = Number(tx.monto);
  const tipo = String(tx.tipo || "").toUpperCase();
  const base = {
    id: `tx-${tx.id_transaccion ?? index}`,
    amount: monto,
    date: tx.fecha,
    read: false,
  };

  if (tipo === "DEPOSITO") {
    return {
      ...base,
      type: NOTIF_TYPES.MONEY_IN,
      title: "Recibiste dinero",
      description: `Depósito en tu cuenta · ${tx.descripcion || "Abono"}`,
    };
  }

  if (tipo === "RETIRO") {
    return {
      ...base,
      type: NOTIF_TYPES.MONEY_OUT,
      title: "Retiraste dinero",
      description: tx.descripcion || "Retiro en cajero",
    };
  }

  if (tipo === "TRANSFERENCIA") {
    if (
      accountId != null &&
      Number(tx.cuenta_destino) === Number(accountId)
    ) {
      return {
        ...base,
        type: NOTIF_TYPES.MONEY_IN,
        title: "Recibiste una transferencia",
        description: tx.descripcion || "Transferencia recibida",
      };
    }
    if (
      accountId != null &&
      Number(tx.cuenta_origen) === Number(accountId)
    ) {
      return {
        ...base,
        type: NOTIF_TYPES.MONEY_OUT,
        title: "Enviaste dinero",
        description: tx.descripcion || "Transferencia enviada",
      };
    }
  }

  return null;
}

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [messages] = useState(MESSAGES_DEMO);
  const [seenAt, setSeenAt] = useState(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(SEEN_KEY) : null;
    return raw ? Number(raw) : 0;
  });

  // Semillas desde el backend (transacciones reales de la cuenta).
  useEffect(() => {
    let cancelled = false;
    const session = getSession();
    const accountId = session?.cuenta?.id_cuenta;
    if (!accountId) return;

    api
      .get(`/transactions/account/${accountId}`)
      .then((response) => {
        if (cancelled) return;
        const mapped = (response.data || [])
          .map((tx, i) => mapTransaction(tx, accountId, i))
          .filter(Boolean);
        setNotifications(mapped);
      })
      .catch(() => {
        // Sin conexión al backend se queda la lista vacía.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const pushNotification = useCallback((notification) => {
    setNotifications((prev) => [
      {
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: NOTIF_TYPES.INFO,
        date: new Date().toISOString(),
        read: false,
        ...notification,
      },
      ...prev,
    ]);
  }, []);

  const markAllSeen = useCallback(() => {
    const now = Date.now();
    setSeenAt(now);
    localStorage.setItem(SEEN_KEY, String(now));
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        read: n.read || new Date(n.date).getTime() <= now,
      }))
    );
  }, []);

  const unreadCount = useMemo(
    () =>
      notifications.filter((n) => {
        const time = new Date(n.date).getTime();
        return !n.read && time > seenAt;
      }).length,
    [notifications, seenAt]
  );

  const unreadMessages = useMemo(() => messages.filter((m) => !m.read).length, [messages]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      messages,
      unreadMessages,
      pushNotification,
      markAllSeen,
      formatCOP,
    }),
    [notifications, unreadCount, messages, unreadMessages, pushNotification, markAllSeen]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error("useNotifications debe usarse dentro de NotificationsProvider");
  }
  return ctx;
}
