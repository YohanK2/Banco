import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  User,
  Wifi,
} from "lucide-react";
import "../assets/styles/registro.css";

const NAME_REGEX = /^.{2,}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validate({ nombre, email, password, confirm }) {
  const errors = {};

  if (!nombre.trim()) {
    errors.nombre = "El nombre es obligatorio.";
  } else if (!NAME_REGEX.test(nombre.trim())) {
    errors.nombre = "Ingresa tu nombre completo.";
  }

  if (!email.trim()) {
    errors.email = "El correo es obligatorio.";
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = "Ingresa un correo válido.";
  }

  if (!password) {
    errors.password = "La contraseña es obligatoria.";
  } else if (password.length < 8) {
    errors.password = "Debe tener al menos 8 caracteres.";
  }

  if (!confirm) {
    errors.confirm = "Confirma tu contraseña.";
  } else if (confirm !== password) {
    errors.confirm = "Las contraseñas no coinciden.";
  }

  return errors;
}

export default function Registro() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: "", email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleField = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      navigate("/login");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rg">
      {/* PANEL DE MARCA */}
      <div className="rg-brand">
        <div className="rg-brand__orbit" />
        <div className="rg-brand__dot" />

        <Link to="/inicio" className="rg-brand__back">
          <ArrowLeft size={15} /> Volver al inicio
        </Link>

        <div className="rg-brand__top">
          <div className="rg-brand__mark">B</div>
          <span className="rg-brand__name">
            Banchocó <em>BANK</em>
          </span>
        </div>

        <motion.div
          className="rg-brand__card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="rg-brand__card-top">
            <span>Saldo total</span>
            <Wifi size={16} className="rg-brand__card-wifi" />
          </div>
          <p className="rg-brand__card-amount tabular">$ 12.450.000,00</p>
          <span className="rg-brand__card-trend">Abre tu cuenta y empieza a ahorrar hoy</span>
          <div className="rg-brand__card-chip" />
          <span className="rg-brand__card-visa">VISA</span>
        </motion.div>

        <motion.div
          className="rg-brand__badge"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <div className="rg-brand__badge-icon">
            <ShieldCheck size={16} />
          </div>
          <p>
            Tu dinero
            <br />
            siempre disponible
          </p>
        </motion.div>

        <p className="rg-brand__tagline">
          Abre tu cuenta en minutos y gestiona tu dinero desde donde estés.
        </p>
      </div>

      {/* PANEL DE FORMULARIO */}
      <div className="rg-panel">
        <motion.form
          className="rg-form"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          onSubmit={handleSubmit}
          noValidate
        >
          <span className="rg-form__eyebrow">Únete a Banchocó</span>
          <h1 className="rg-form__title">Abrir mi cuenta</h1>
          <p className="rg-form__subtitle">Completa tus datos para crear tu cuenta.</p>

          <div className="rg-field">
            <label htmlFor="nombre" className="rg-field__label">Nombre completo</label>
            <div className={`rg-field__control ${errors.nombre ? "rg-field__control--error" : ""}`}>
              <User size={16} className="rg-field__icon" />
              <input
                id="nombre"
                name="nombre"
                type="text"
                autoComplete="name"
                placeholder="Nombre y apellido"
                value={form.nombre}
                onChange={handleField("nombre")}
                aria-invalid={!!errors.nombre}
                aria-describedby={errors.nombre ? "nombre-error" : undefined}
              />
            </div>
            {errors.nombre && (
              <p id="nombre-error" className="rg-field__error" role="alert">{errors.nombre}</p>
            )}
          </div>

          <div className="rg-field">
            <label htmlFor="email" className="rg-field__label">Correo</label>
            <div className={`rg-field__control ${errors.email ? "rg-field__control--error" : ""}`}>
              <Mail size={16} className="rg-field__icon" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="tucorreo@ejemplo.com"
                value={form.email}
                onChange={handleField("email")}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
            </div>
            {errors.email && (
              <p id="email-error" className="rg-field__error" role="alert">{errors.email}</p>
            )}
          </div>

          <div className="rg-field">
            <label htmlFor="password" className="rg-field__label">Contraseña</label>
            <div className={`rg-field__control ${errors.password ? "rg-field__control--error" : ""}`}>
              <Lock size={16} className="rg-field__icon" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                value={form.password}
                onChange={handleField("password")}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
              <button
                type="button"
                className="rg-field__toggle"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="rg-field__error" role="alert">{errors.password}</p>
            )}
          </div>

          <div className="rg-field">
            <label htmlFor="confirm" className="rg-field__label">Confirmar contraseña</label>
            <div className={`rg-field__control ${errors.confirm ? "rg-field__control--error" : ""}`}>
              <Lock size={16} className="rg-field__icon" />
              <input
                id="confirm"
                name="confirm"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Repite tu contraseña"
                value={form.confirm}
                onChange={handleField("confirm")}
                aria-invalid={!!errors.confirm}
                aria-describedby={errors.confirm ? "confirm-error" : undefined}
              />
            </div>
            {errors.confirm && (
              <p id="confirm-error" className="rg-field__error" role="alert">{errors.confirm}</p>
            )}
          </div>

          <button type="submit" className="rg-submit" disabled={submitting}>
            {submitting ? "Creando cuenta…" : "Crear mi cuenta"}
            {!submitting && <ArrowRight size={16} />}
          </button>

          <p className="rg-form__footer">
            ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
          </p>
        </motion.form>
      </div>
    </div>
  );
}
