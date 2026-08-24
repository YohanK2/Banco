import { useState } from "react";
import Swal from "sweetalert2";
import {
  ArrowUpFromLine,
  Bell,
  CheckCircle2,
  CreditCard,
  KeyRound,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Sidebar from "../components/Sidebar.jsx";
import Topbar from "../components/Topbar.jsx";
import { useProfile } from "../hooks/useProfile";
import { getFullName } from "../components/UserMenu.jsx";
import "../assets/styles/topbar.css";
import "../assets/styles/ajustes.css";

/*
  BANCHOCÓ BANK — Ajustes
  --------------------------------------------------
  Página de configuración conectada al enlace "Ajustes"
  del sidebar y a la opción "Configuraciones" del menú
  de usuario. También sirve la vista "Mi perfil".
*/

const SECTIONS = [
  { id: "perfil", label: "Mi perfil", icon: UserRound },
  { id: "seguridad", label: "Seguridad", icon: KeyRound },
  { id: "notificaciones", label: "Notificaciones", icon: Bell },
  { id: "limites", label: "Límites", icon: ArrowUpFromLine },
];

const LIMITES = [
  { label: "Límite diario", usado: 2450000, tope: 5000000 },
  { label: "Límite mensual", usado: 8600000, tope: 20000000 },
];

const formatCOP = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export default function Ajustes({ initialSection = "perfil" }) {
  const { profile, loading } = useProfile();
  const [section, setSection] = useState(initialSection);

  const cliente = profile?.cliente;
  const cuenta = profile?.cuenta;

  const [prefs, setPrefs] = useState({
    pushTransacciones: true,
    emailPromos: false,
    resumenSemanal: true,
  });

  const [passwords, setPasswords] = useState({
    actual: "",
    nueva: "",
    confirmar: "",
  });

  const handlePref = (key) => () => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePasswordChange = (field) => (e) => {
    setPasswords((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const guardarPassword = () => {
    if (!passwords.actual || !passwords.nueva || !passwords.confirmar) {
      Swal.fire({
        title: "Campos incompletos",
        text: "Completa todos los campos para cambiar tu contraseña.",
        icon: "warning",
        confirmButtonColor: "#0B3D2E",
      });
      return;
    }
    if (passwords.nueva.length < 8) {
      Swal.fire({
        title: "Contraseña muy corta",
        text: "La nueva contraseña debe tener al menos 8 caracteres.",
        icon: "warning",
        confirmButtonColor: "#0B3D2E",
      });
      return;
    }
    if (passwords.nueva !== passwords.confirmar) {
      Swal.fire({
        title: "No coinciden",
        text: "La confirmación no coincide con la nueva contraseña.",
        icon: "error",
        confirmButtonColor: "#0B3D2E",
      });
      return;
    }
    // Aquí se conectaría con el endpoint de cambio de contraseña del backend.
    Swal.fire({
      title: "Contraseña actualizada",
      text: "Tu contraseña se cambió correctamente.",
      icon: "success",
      timer: 1800,
      showConfirmButton: false,
    });
    setPasswords({ actual: "", nueva: "", confirmar: "" });
  };

  const title = section === "perfil" ? "Mi perfil" : "Ajustes";

  return (
    <div className="aj-page">
      <Sidebar />

      <div className="aj-main">
        <Topbar title={title} />

        <div className="aj-content">
          <nav className="aj-tabs">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                className={`aj-tab ${section === id ? "is-active" : ""}`}
                onClick={() => setSection(id)}
              >
                <Icon size={16} />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          {/* ---------- PERFIL ---------- */}
          {section === "perfil" && (
            <section className="aj-card">
              <header className="aj-card__head">
                <div className="aj-avatar-row">
                  <span className="aj-avatar">{loading ? "" : getFullName(profile).charAt(0)}</span>
                  <div>
                    <h2>{loading ? "Cargando…" : getFullName(profile)}</h2>
                    <p>Cliente Banchocó desde 2026</p>
                  </div>
                </div>
              </header>

              <div className="aj-grid-2">
                <div className="aj-info">
                  <span className="aj-info__label">Nombres</span>
                  <span className="aj-info__value">{cliente?.nombres || "—"}</span>
                </div>
                <div className="aj-info">
                  <span className="aj-info__label">Apellidos</span>
                  <span className="aj-info__value">{cliente?.apellidos || "—"}</span>
                </div>
                <div className="aj-info">
                  <span className="aj-info__label"><Mail size={13} /> Correo</span>
                  <span className="aj-info__value">{profile?.correo || "—"}</span>
                </div>
                <div className="aj-info">
                  <span className="aj-info__label"><CreditCard size={13} /> Documento</span>
                  <span className="aj-info__value">{cliente?.documento || "—"}</span>
                </div>
                <div className="aj-info">
                  <span className="aj-info__label"><Phone size={13} /> Teléfono</span>
                  <span className="aj-info__value">{cliente?.telefono || "—"}</span>
                </div>
                <div className="aj-info">
                  <span className="aj-info__label"><MapPin size={13} /> Dirección</span>
                  <span className="aj-info__value">{cliente?.direccion || "—"}</span>
                </div>
                <div className="aj-info aj-info--wide">
                  <span className="aj-info__label"><CreditCard size={13} /> Cuenta bancaria</span>
                  <span className="aj-info__value">
                    {cuenta
                      ? `Cuenta ${cuenta.tipo || "AHORROS"} •••• ${(cuenta.numero_cuenta || "").slice(-4)}`
                      : "—"}
                  </span>
                </div>
              </div>

              <p className="aj-note">
                Para actualizar tus datos personales escríbenos a soporte@banchoco.com.
              </p>
            </section>
          )}

          {/* ---------- SEGURIDAD ---------- */}
          {section === "seguridad" && (
            <section className="aj-card">
              <header className="aj-card__head">
                <div>
                  <h2>Cambiar contraseña</h2>
                  <p>Mantén tu cuenta protegida con una contraseña fuerte.</p>
                </div>
                <ShieldCheck size={26} className="aj-card__icon" />
              </header>

              <form
                className="aj-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  guardarPassword();
                }}
              >
                <div className="aj-field">
                  <label htmlFor="pass-actual">Contraseña actual</label>
                  <input
                    id="pass-actual"
                    type="password"
                    autoComplete="current-password"
                    value={passwords.actual}
                    onChange={handlePasswordChange("actual")}
                    placeholder="••••••••"
                  />
                </div>
                <div className="aj-grid-2">
                  <div className="aj-field">
                    <label htmlFor="pass-nueva">Nueva contraseña</label>
                    <input
                      id="pass-nueva"
                      type="password"
                      autoComplete="new-password"
                      value={passwords.nueva}
                      onChange={handlePasswordChange("nueva")}
                      placeholder="Mínimo 8 caracteres"
                    />
                  </div>
                  <div className="aj-field">
                    <label htmlFor="pass-confirmar">Confirmar contraseña</label>
                    <input
                      id="pass-confirmar"
                      type="password"
                      autoComplete="new-password"
                      value={passwords.confirmar}
                      onChange={handlePasswordChange("confirmar")}
                      placeholder="Repite tu contraseña"
                    />
                  </div>
                </div>
                <button type="submit" className="btn-primary">
                  Guardar cambios
                </button>
              </form>
            </section>
          )}

          {/* ---------- NOTIFICACIONES ---------- */}
          {section === "notificaciones" && (
            <section className="aj-card">
              <header className="aj-card__head">
                <div>
                  <h2>Preferencias de notificación</h2>
                  <p>Elige qué avisos quieres recibir en el sistema.</p>
                </div>
                <Bell size={26} className="aj-card__icon" />
              </header>

              <div className="aj-toggles">
                {[
                  {
                    key: "pushTransacciones",
                    title: "Alertas de transacciones",
                    text: "Notificaciones cuando recibas o envíes dinero.",
                  },
                  {
                    key: "emailPromos",
                    title: "Promociones por correo",
                    text: "Ofertas y novedades de Banchocó Bank.",
                  },
                  {
                    key: "resumenSemanal",
                    title: "Resumen semanal",
                    text: "Un resumen de tus movimientos cada lunes.",
                  },
                ].map(({ key, title: t, text }) => (
                  <label key={key} className="aj-toggle">
                    <div>
                      <strong>{t}</strong>
                      <p>{text}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={prefs[key]}
                      onChange={handlePref(key)}
                    />
                    <span className="aj-toggle__track" aria-hidden="true" />
                  </label>
                ))}
              </div>

              <p className="aj-note">
                <CheckCircle2 size={14} /> Los cambios se guardan automáticamente.
              </p>
            </section>
          )}

          {/* ---------- LÍMITES ---------- */}
          {section === "limites" && (
            <section className="aj-card">
              <header className="aj-card__head">
                <div>
                  <h2>Límites de transferencia</h2>
                  <p>Controla cuánto puedes mover por día y por mes.</p>
                </div>
                <ArrowUpFromLine size={26} className="aj-card__icon" />
              </header>

              <div className="aj-limits">
                {LIMITES.map((l) => {
                  const pct = Math.min(100, Math.round((l.usado / l.tope) * 100));
                  return (
                    <div key={l.label} className="aj-limit">
                      <div className="aj-limit__row">
                        <span>{l.label}</span>
                        <span>
                          {formatCOP(l.usado)} / {formatCOP(l.tope)}
                        </span>
                      </div>
                      <div className="aj-limit__bar">
                        <div style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="aj-note">
                ¿Necesitas un límite mayor? Solicítalo desde el soporte del banco.
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
