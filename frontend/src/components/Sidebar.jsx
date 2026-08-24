import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import "../assets/styles/Sidebar.css";

/*
  BANCHOCÓ BANK — sidebar compartido
  --------------------------------------------------
  Sidebar de panel (estilo transferencias) reutilizable en
  todas las páginas de la sesión. En escritorio es una columna
  fija a la izquierda con marca, navegación, promoción y cierre
  de sesión; en móvil se oculta y aparece una barra superior con
  menú desplegable.
*/

const NAV_LINKS = [
  { to: "/dashboard", icon: LayoutGrid, label: "Resumen" },
  { to: "/transferencias", icon: ArrowLeftRight, label: "Transferencias" },
  { to: "/movimientos", icon: Wallet, label: "Saldo y Movimientos" },
  { to: "/retiros", icon: ArrowUpFromLine, label: "Retiros" },
  { to: "/ajustes", icon: Settings, label: "Ajustes" },
];

const BanchocoSidebar = () => {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    setUser(userData ? JSON.parse(userData) : null);
  }, [location]);

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

        <div className="sb-promo">
          <p className="sb-promo__title">Invita y gana</p>
          <p className="sb-promo__text">
            Gana hasta $50.000 por cada amigo que abra su cuenta.
          </p>
          <button type="button" className="sb-promo__btn">
            Invitar amigos
          </button>
        </div>

        <div className="sb-user">
          <div className="sb-user__chip">
            <span className="sb-user__avatar">{getUserInitials()}</span>
            <span className="sb-user__info">
              <strong>{getUserName()}</strong>
              <small>{user?.email || ""}</small>
            </span>
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
          <button className="sb-mobile-link sb-mobile-logout" onClick={handleLogout}>
            <LogOut size={17} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      )}
    </>
  );
};

export default BanchocoSidebar;
