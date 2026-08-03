import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, Wifi, ArrowRight } from "lucide-react";
import "../assets/styles/login.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="login">
      {/* PANEL DE MARCA */}
      <div className="login__brand">
        <video className="login__video" autoPlay muted loop playsInline>
          <source src="/choco/sexo.mp4" type="video/mp4" />
        </video>
        <div className="login__brand-overlay" />

        <motion.div
          className="login__brand-content"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="login__mark">
            <Wifi size={18} color="#F2A93B" strokeWidth={2.5} />
          </div>
          <p className="login__tagline">
            Tu dinero se mueve con vos. Banchocó te muestra cada movimiento, sin fricción.
          </p>
        </motion.div>
      </div>

      {/* PANEL DE FORMULARIO */}
      <div className="login__panel">
        <motion.form
          className="login__form"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          onSubmit={handleSubmit}
          noValidate
        >
          <span className="login__name">Banchocó</span>
          <h1 className="login__title">Iniciar sesión</h1>
          <p className="login__subtitle">Ingresa tus datos para ver tu cuenta.</p>

            <div className="field">
            <label htmlFor="email" className="field__label">Correo</label>
            <div className="field__control">
              <Mail size={16} className="field__icon" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="tucorreo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="password" className="field__label">Contraseña</label>
            <div className="field__control">
              <Lock size={16} className="field__icon" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          </div>

          <div className="login__row">
            <label className="checkbox">
              <input type="checkbox" />
              <span>Recordarme</span>
            </label>
            <a href="#" className="login__link">¿Olvidaste tu contraseña?</a>
          </div>

          <button type="submit" className="login__submit">
            Ingresar
            <ArrowRight size={16} />
          </button>
        </motion.form>
      </div>
    </div>
  );
}