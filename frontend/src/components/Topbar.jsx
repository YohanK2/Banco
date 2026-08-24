import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronDown, Mail, Search } from "lucide-react";
import { useProfile } from "../hooks/useProfile";
import { useNotifications } from "../context/NotificationsContext.jsx";
import {
  USER_MENU_ITEMS,
  getFirstName,
  getInitials,
  getEmail,
  useOutsideClose,
} from "./UserMenu.jsx";
import NotificationsModal from "./NotificationsModal.jsx";
import MessagesModal from "./MessagesModal.jsx";

/*
  BANCHOCÓ BANK — topbar compartido
  --------------------------------------------------
  Barra superior flotante (despegada de arriba y de los
  lados, centrada y con esquinas curveadas) usada en
  todas las secciones: Resumen, Transferencias, Saldo y
  movimientos, Retiros, Historial y Ajustes.

  Incluye búsqueda, campana de notificaciones (modal),
  mensajes (modal) y el chip "Hola, {nombre}" con flecha
  que despliega Mi perfil / Configuraciones / Notificaciones.
*/

export default function Topbar({ title = "" }) {
  const navigate = useNavigate();
  const { profile, loading } = useProfile();
  const { unreadCount, unreadMessages, markAllSeen } = useNotifications();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);

  const menuRef = useRef(null);
  useOutsideClose(menuRef, menuOpen ? () => setMenuOpen(false) : null);

  const handleMenuAction = (item) => {
    if (item.action === "notifications") {
      setMenuOpen(false);
      setShowNotifications(true);
      return;
    }
    if (item.to) {
      setMenuOpen(false);
      navigate(item.to);
    }
  };

  return (
    <div className="tb-wrap">
      <header className="tb">
        <h1 className="tb__title">{title}</h1>

        <div className="tb__search">
          <Search size={16} />
          <input type="text" placeholder="Buscar transacciones, contactos..." />
        </div>

        <div className="tb__actions">
          <button
            type="button"
            className="tb-icon-btn"
            aria-label="Notificaciones"
            onClick={() => setShowNotifications(true)}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="tb-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
            )}
          </button>
          <button
            type="button"
            className="tb-icon-btn"
            aria-label="Mensajes"
            onClick={() => setShowMessages(true)}
          >
            <Mail size={18} />
            {unreadMessages > 0 && (
              <span className="tb-badge">
                {unreadMessages > 9 ? "9+" : unreadMessages}
              </span>
            )}
          </button>

          <div className="tb-user" ref={menuRef}>
            <button
              type="button"
              className="tb-user-chip"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              <span className="tb-avatar">
                {loading && !profile?.cliente ? "" : getInitials(profile)}
              </span>
              <span className="tb-chip-name">
                {loading ? (
                  <span className="tb-skeleton tb-skeleton--text" />
                ) : (
                  `Hola, ${getFirstName(profile)}`
                )}
              </span>
              <ChevronDown size={15} className={menuOpen ? "is-open" : ""} />
            </button>

            {menuOpen && (
              <div className="tb-menu" role="menu">
                <div className="tb-menu__head">
                  <strong>{loading ? "Cargando…" : getFirstName(profile)}</strong>
                  <small>{getEmail(profile)}</small>
                </div>
                {USER_MENU_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="menuitem"
                    className="tb-menu__item"
                    onClick={() => handleMenuAction(item)}
                  >
                    <item.icon size={16} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <NotificationsModal
        open={showNotifications}
        onClose={() => {
          setShowNotifications(false);
          markAllSeen();
        }}
      />
      <MessagesModal open={showMessages} onClose={() => setShowMessages(false)} />
    </div>
  );
}
