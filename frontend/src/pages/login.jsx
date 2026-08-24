import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";
import authService from "../services/authService.js";
import "../assets/styles/login.css";

const VIDEO_SRC = "/choco/inicio.mp4";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validate({ email, password }) {
  const errors = {};

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

  return errors;
}

export default function BanchocoLogin({ onLogin = () => {} }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const nextErrors = validate({ email, password });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await authService.login(email.trim(), password);
      onLogin(email.trim(), password);
      navigate("/dashboard");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        const detail = err.response.data.detail;
        setServerError(typeof detail === "string" ? detail : "Credenciales inválidas.");
      } else {
        setServerError("No se pudo conectar con el servidor bancario.");
      }
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="bl">
      {/* PANEL DE MARCA — video a sangre */}
      <div className="bl-brand">
        <video
          className="bl-brand__video"
          src={VIDEO_SRC}
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="bl-brand__overlay" />
        <div className="bl-brand__orbit" />
        <div className="bl-brand__dot" />

        <motion.div
          className="bl-brand__header"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bl-brand__top">
            <div className="bl-brand__mark">B</div>
            <span className="bl-brand__name">
              Banchocó <em>BANK</em>
            </span>
          </div>

          <div className="bl-brand__badge">
            <div className="bl-brand__badge-icon">
              <ShieldCheck size={15} />
            </div>
            <p>
              Tu dinero
              <br />
              siempre disponible
            </p>
          </div>
        </motion.div>

        <motion.p
          className="bl-brand__tagline"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          Gestiona tu dinero de forma fácil, rápida y segura desde donde estés.
        </motion.p>
      </div>

      {/* PANEL DE FORMULARIO */}
      <div className="bl-panel">
        <motion.form
          className="bl-form"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          onSubmit={handleSubmit}
          noValidate
        >
          <span className="bl-form__eyebrow">Bienvenido de nuevo</span>
          <h1 className="bl-form__title">Iniciar sesión</h1>
          <p className="bl-form__subtitle">Ingresa tus datos para ver tu cuenta.</p>

          {serverError && (
            <div
              role="alert"
              style={{
                display: "flex", alignItems: "flex-start", gap: "8px",
                background: "#fff0f0", border: "1px solid #f5c2c7",
                borderRadius: "8px", padding: "10px 14px",
                color: "#b00020", fontSize: "0.85rem", marginBottom: "4px",
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
              <span>{serverError}</span>
            </div>
          )}

          <div className="field">
            <label htmlFor="email" className="field__label">Correo</label>
            <div className={`field__control ${errors.email ? "field__control--error" : ""}`}>
              <Mail size={16} className="field__icon" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="tucorreo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
            </div>
            {errors.email && (
              <p id="email-error" className="field__error" role="alert">{errors.email}</p>
            )}
          </div>

          <div className="field">
            <label htmlFor="password" className="field__label">Contraseña</label>
            <div className={`field__control ${errors.password ? "field__control--error" : ""}`}>
              <Lock size={16} className="field__icon" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
              <button
                type="button"
                className="field__toggle"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="field__error" role="alert">{errors.password}</p>
            )}
          </div>

          <div className="bl-form__row">
            <label className="checkbox">
              <input type="checkbox" />
              <span>Recordarme</span>
            </label>
            <a href="#" className="bl-form__link">¿Olvidaste tu contraseña?</a>
          </div>

          <button type="submit" className="bl-submit" disabled={submitting}>
            {submitting ? "Ingresando…" : "Iniciar sesión"}
            {!submitting && <ArrowRight size={16} />}
          </button>

          <p className="bl-form__footer">
            ¿No tienes cuenta? <a href="/registro">Abrir cuenta</a>
          </p>
        </motion.form>
      </div>
    </div>
  );
}