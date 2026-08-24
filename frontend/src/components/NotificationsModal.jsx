import { useEffect } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  CheckCheck,
  Info,
  X,
} from "lucide-react";
import { useNotifications } from "../context/NotificationsContext.jsx";

/*
  BANCHOCÓ BANK — modal de notificaciones
  Muestra las acciones del sistema: dinero recibido,
  enviado, retiros y avisos.
*/

const TYPE_ICON = {
  money_in: { Icon: ArrowDownLeft, className: "is-in", sign: "+" },
  money_out: { Icon: ArrowUpRight, className: "is-out", sign: "-" },
  info: { Icon: Info, className: "is-info", sign: "" },
};

function formatWhen(date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Ahora mismo";
  if (min < 60) return `Hace ${min} min`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Hace ${days} d`;
  return d.toLocaleDateString("es-CO", { day: "numeric", month: "short" });
}

export default function NotificationsModal({ open, onClose }) {
  const { notifications, unreadCount, formatCOP, markAllSeen } = useNotifications();

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="tb-modal-overlay" onClick={onClose}>
      <div
        className="tb-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Notificaciones"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="tb-modal__head">
          <div>
            <h3>Notificaciones</h3>
            <p>
              {unreadCount > 0
                ? `Tienes ${unreadCount} notificación${unreadCount === 1 ? "" : "es"} sin leer`
                : "Estás al día"}
            </p>
          </div>
          <div className="tb-modal__head-actions">
            {notifications.length > 0 && (
              <button type="button" className="tb-modal__link" onClick={markAllSeen}>
                <CheckCheck size={15} />
                Marcar leídas
              </button>
            )}
            <button
              type="button"
              className="tb-modal__close"
              onClick={onClose}
              aria-label="Cerrar"
            >
              <X size={17} />
            </button>
          </div>
        </header>

        <div className="tb-modal__body">
          {notifications.length === 0 ? (
            <div className="tb-empty">
              <Bell size={22} />
              <strong>No hay notificaciones todavía</strong>
              <span>Cuando recibas o envíes dinero, lo verás aquí.</span>
            </div>
          ) : (
            notifications.map((n) => {
              const { Icon, className, sign } = TYPE_ICON[n.type] || TYPE_ICON.info;
              const isMoney = n.type !== "info" && n.amount != null;
              return (
                <article key={n.id} className={`tb-notif ${n.read ? "" : "is-unread"}`}>
                  <span className={`tb-notif__icon ${className}`}>
                    <Icon size={16} />
                  </span>
                  <div className="tb-notif__body">
                    <strong>{n.title}</strong>
                    <p>{n.description}</p>
                    <time>{formatWhen(n.date)}</time>
                  </div>
                  {isMoney && (
                    <span className={`tb-notif__amount ${className}`}>
                      {sign} {formatCOP(n.amount)}
                    </span>
                  )}
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
