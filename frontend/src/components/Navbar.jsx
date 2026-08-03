import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import {
  LayoutGrid,
  ArrowLeftRight,
  Wallet,
  ArrowUpFromLine,
  History,
  ChevronDown,
  Menu,
  X,
  LogOut,
  User,
  Headset,
} from "lucide-react";
import "../assets/styles/navbar.css";

/*
  MAREA BANK — navbar principal
  --------------------------------------------------
  Misma estructura de referencia (marca a la izquierda, píldora de
  enlaces al centro, usuario + dropdown a la derecha), reskineada
  con la paleta de Marea: fondo claro, píldora activa en degradado
  navy, acento ámbar en el logo.

  NAV_LINKS solo trae { to, icon, label }. Si en el futuro necesitas
  bloquear secciones por estado de cuenta (como hacía allowedStatuses
  en NavKahuaCredit), se puede reintroducir el mismo patrón aquí.
*/

const NAV_LINKS = [
  { to: "/dashboard", icon: LayoutGrid, label: "Resumen" },
  { to: "/transferencias", icon: ArrowLeftRight, label: "Transferencias" },
  { to: "/movimientos", icon: Wallet, label: "Saldo y Movimientos" },
  { to: "/retiros", icon: ArrowUpFromLine, label: "Retiros" },
  { to: "/historial", icon: History, label: "Historial" },
];

const MareaNavbar = () => {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    setUser(userData ? JSON.parse(userData) : null);
  }, [location]);

  useEffect(() => {
    const close = (e) => {
      if (!e.target.closest(".mnav-user")) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const getUserName = () => {
    if (!user) return "Usuario";
    return user.first_name || user.email || "Usuario";
  };

  const getUserInitials = () => {
    if (!user) return "U";
    const a = user.first_name?.charAt(0) || "";
    const b = user.last_name?.charAt(0) || "";
    return (a + b).toUpperCase() || "U";
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
    <nav className="mnav">
      <div className="mnav-inner">
        {/* ── Marca ── */}
        <Link to="/dashboard" className="mnav-brand">
          <span className="mnav-brand-main">Banchocó</span>
          <span className="mnav-brand-sub">Bank</span>
        </Link>

        {/* ── Enlaces (píldora, desktop) ── */}
        <div className="mnav-links">
          {NAV_LINKS.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`mnav-link ${isActive(to) ? "mnav-link--active" : ""}`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </Link>
          ))}
        </div>

        {/* ── Usuario + hamburguesa ── */}
        <div className="mnav-right">
          <div className="mnav-user">
            <button
              type="button"
              className="mnav-user-trigger"
              onClick={() => setDropdownOpen((o) => !o)}
            >
              <div className="mnav-avatar">{getUserInitials()}</div>
              <div className="mnav-user-info">
                <span className="mnav-user-greeting">Hola,</span>
                <span className="mnav-user-name">{getUserName()}</span>
              </div>
              <ChevronDown size={15} className={`mnav-chevron ${dropdownOpen ? "open" : ""}`} />
            </button>

            {dropdownOpen && (
              <div className="mnav-dropdown">
                <div className="mnav-dropdown-header">
                  <div className="mnav-dropdown-avatar">{getUserInitials()}</div>
                  <div>
                    <p className="mnav-dropdown-name">{getUserName()}</p>
                    <p className="mnav-dropdown-email">{user?.email || ""}</p>
                  </div>
                </div>

                <div className="mnav-dropdown-divider" />

                <Link to="/perfil" className="mnav-dropdown-item">
                  <User size={15} />
                  <span>Mi perfil</span>
                </Link>
                <Link to="/dashboard" className="mnav-dropdown-item">
                  <LayoutGrid size={15} />
                  <span>Resumen</span>
                </Link>
                <Link to="/soporte" className="mnav-dropdown-item">
                  <Headset size={15} />
                  <span>Soporte</span>
                </Link>

                <div className="mnav-dropdown-divider" />

                <button className="mnav-dropdown-item mnav-logout" onClick={handleLogout}>
                  <LogOut size={15} />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            )}
          </div>

          <button
            className="mnav-hamburger"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menú"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ── Menú desplegable móvil ── */}
      {menuOpen && (
        <div className="mnav-mobile-menu">
          {NAV_LINKS.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`mnav-mobile-link ${isActive(to) ? "mnav-mobile-link--active" : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              <Icon size={17} />
              <span>{label}</span>
            </Link>
          ))}
          <div className="mnav-mobile-divider" />
          <button className="mnav-mobile-link mnav-logout" onClick={handleLogout}>
            <LogOut size={17} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default MareaNavbar;