import React, { useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import {
  LayoutGrid,
  ArrowLeftRight,
  Wallet,
  ArrowUpFromLine,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import "../assets/styles/Sidebar.css";
import "../assets/styles/topbar.css";
import { useProfile } from "../hooks/useProfile";
import { clearSession } from "../services/auth";
import {
  USER_MENU_ITEMS,
  getFullName,
  getInitials,
  getEmail,
  useOutsideClose,
} from "./UserMenu.jsx";
import NotificationsModal from "./NotificationsModal.jsx";

/*
  BANCHOCÓ BANK — sidebar compartido
  --------------------------------------------------
  Sidebar de panel reutilizable en todas las páginas de la
  sesión. El chip de usuario espera los datos del backend
  (GET /users/{id} + GET /clients/{id}) y muestra el nombre
  real de quien inició sesión. La flechita dentro del chip
  despliega: Mi perfil, Configuraciones y Notificaciones.
*/

const NAV_LINKS = [
  { to: "/dashboard", icon: LayoutGrid, label: "Resumen" },
  { to: "/transferencias", icon: ArrowLeftRight, label: "Transferencias" },
  { to: "/movimientos", icon: Wallet, label: "Saldo y Movimientos" },
  { to: "/retiros", icon: ArrowUpFromLine, label: "Retiros" },
  { to: "/ajustes", icon: Settings, label: "Ajustes" },
];

const BanchocoSidebar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { profile, loading } = useProfile();

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

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    Swal.fire({
      title: "¿Cerrar sesión?",
      text: "Tu sesión se cerrará y volverás al inicio.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0B3D2E",
      cancelButtonColor: "#94A0B4",
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "No, mantenerme aquí",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("active_account");
        Swal.fire({
          title: "Sesión cerrada",
          text: "Has salido correctamente.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate("/login");
      }
    });
  };

  return (
    <>
      {/* ================= SIDEBAR ESCRITORIO ================= */}
      <aside className="sb-sidebar">
        <Link to="/dashboard" className="sb-brand">
          <span className="sb-brand__mark">B</span>
          <span className="sb-brand__text">
            Banchocó <em>BANK</em>
          </span>
        </Link>

        <nav className="sb-nav">
          {NAV_LINKS.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`sb-nav__link ${isActive(to) ? "is-active" : ""}`}
            >
              <Icon size={17} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="sb-user">
          <div className="sb-user__wrap" ref={menuRef}>

            {menuOpen && (
              <div className="tb-menu tb-menu--sidebar" role="menu">
                <div className="tb-menu__head">
                  <strong>{loading ? "Cargando…" : getFullName(profile)}</strong>
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

          <button type="button" className="sb-logout" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* ================= BARRA MÓVIL ================= */}
      <header className="sb-mobilebar">
        <Link to="/dashboard" className="sb-brand">
          <span className="sb-brand__mark">B</span>
          <span className="sb-brand__text">
            Banchocó <em>BANK</em>
          </span>
        </Link>

        <button
          type="button"
          className="sb-burger"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Menú"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* ================= MENÚ MÓVIL ================= */}
      {menuOpen && (
        <div className="sb-mobile-menu">
          {NAV_LINKS.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`sb-mobile-link ${isActive(to) ? "is-active" : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              <Icon size={17} />
              <span>{label}</span>
            </Link>
          ))}
          <div className="sb-mobile-divider" />
          {USER_MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="sb-mobile-link"
              onClick={() =>
                item.action === "notifications"
                  ? setShowNotifications(true)
                  : handleMenuAction(item)
              }
            >
              <item.icon size={17} />
              <span>{item.label}</span>
            </button>
          ))}
          <div className="sb-mobile-divider" />
          <button className="sb-mobile-link sb-mobile-logout" onClick={handleLogout}>
            <LogOut size={17} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      )}

      <NotificationsModal
        open={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
};

export default BanchocoSidebar;
