import { useEffect } from "react";
import { Mail, X } from "lucide-react";
import { useNotifications } from "../context/NotificationsContext.jsx";

/*
  BANCHOCÓ BANK — modal de mensajes
*/

function formatWhen(date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es-CO", { day: "numeric", month: "short" });
}

export default function MessagesModal({ open, onClose }) {
  const { messages, unreadMessages } = useNotifications();

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
        aria-label="Mensajes"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="tb-modal__head">
          <div>
            <h3>Mensajes</h3>
            <p>
              {unreadMessages > 0
                ? `${unreadMessages} mensaje${unreadMessages === 1 ? "" : "s"} sin leer`
                : "Bandeja al día"}
            </p>
          </div>
          <button
            type="button"
            className="tb-modal__close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={17} />
          </button>
        </header>

        <div className="tb-modal__body">
          {messages.length === 0 ? (
            <div className="tb-empty">
              <Mail size={22} />
              <strong>No tienes mensajes</strong>
              <span>Tu bandeja está vacía por ahora.</span>
            </div>
          ) : (
            messages.map((m) => (
              <article key={m.id} className={`tb-notif ${m.read ? "" : "is-unread"}`}>
                <span className="tb-notif__icon is-info">
                  <Mail size={16} />
                </span>
                <div className="tb-notif__body">
                  <strong>{m.subject}</strong>
                  <p>{m.preview}</p>
                  <time>
                    {m.from} · {formatWhen(m.date)}
                  </time>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
