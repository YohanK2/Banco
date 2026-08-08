import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Menu, X } from "lucide-react";
import "../assets/styles/InicioNavbar.css";

const NAV_ITEMS = [
  { label: "Inicio", href: "#inicio", active: true },
  { label: "Productos", href: "#productos" },
  { label: "Para ti", href: "#para-ti" },
  { label: "Seguridad", href: "#seguridad" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Ayuda", href: "#ayuda" },
];

export default function InicioNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bc-nav">
      <div className="bc-nav__inner">
        <div className="bc-nav__brand">
          <div className="bc-nav__mark">
            <span>B</span>
          </div>
          <span className="bc-nav__name">
            Banchocó <span>BANK</span>
          </span>
        </div>

        <nav className="bc-nav__links">
          {NAV_ITEMS.map((item) => (
            <a key={item.label} href={item.href} className={`bc-nav__link ${item.active ? "is-active" : ""}`}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="bc-nav__actions">
          <button className="bc-icon-btn" aria-label="Buscar">
            <Search size={17} />
          </button>
          <span className="bc-nav__divider" />
          <Link to="/login" className="bc-nav__signin">Iniciar sesión</Link>
          <Link to="/registro" className="btn btn--gold">Abrir cuenta</Link>
          <button className="bc-hamburger" onClick={() => setMobileOpen((o) => !o)} aria-label="Menú">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <motion.div
          className="bc-nav__mobile"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="bc-nav__mobile-link"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <Link to="/login" className="bc-nav__mobile-link" onClick={() => setMobileOpen(false)}>
            Iniciar sesión
          </Link>
          <Link to="/registro" className="bc-nav__mobile-link" onClick={() => setMobileOpen(false)}>
            Abrir cuenta
          </Link>
        </motion.div>
      )}
    </header>
  );
}
