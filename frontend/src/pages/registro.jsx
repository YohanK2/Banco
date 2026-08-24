import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  Wifi,
} from "lucide-react";
import "../assets/styles/registro.css";

import authService from "../services/authService.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validate({

  nombres,
  apellidos,
  documento,
  telefono,
  direccion,
  correo,
  contrasena,
  confirmar_contrasena,
}) {
  const errors = {};

  if (!nombres || !nombres.trim()) {
    errors.nombres = "Los nombres son obligatorios.";
  } else if (nombres.trim().length < 2) {
    errors.nombres = "Ingresa nombres válidos (mínimo 2 caracteres).";
  }

  if (!apellidos || !apellidos.trim()) {
    errors.apellidos = "Los apellidos son obligatorios.";
  } else if (apellidos.trim().length < 2) {
    errors.apellidos = "Ingresa apellidos válidos (mínimo 2 caracteres).";
  }

  if (!documento || !documento.trim()) {
    errors.documento = "El número de documento es obligatorio.";
  } else if (documento.trim().length < 5) {
    errors.documento = "El documento debe tener al menos 5 caracteres.";
  }

  if (!telefono || !telefono.trim()) {
    errors.telefono = "El teléfono es obligatorio.";
  } else if (telefono.trim().length < 7) {
    errors.telefono = "Ingresa un teléfono válido (mínimo 7 dígitos).";
  }

  if (!direccion || !direccion.trim()) {
    errors.direccion = "La dirección es obligatoria.";
  } else if (direccion.trim().length < 3) {
    errors.direccion = "Ingresa una dirección válida.";
  }

  if (!correo || !correo.trim()) {
    errors.correo = "El correo es obligatorio.";
  } else if (!EMAIL_REGEX.test(correo.trim())) {
    errors.correo = "Ingresa un correo electrónico válido.";
  }

  if (!contrasena) {
    errors.contrasena = "La contraseña es obligatoria.";
  } else if (contrasena.length < 8) {
    errors.contrasena = "Debe tener al menos 8 caracteres.";
  }

  if (!confirmar_contrasena) {
    errors.confirmar_contrasena = "Confirma tu contraseña.";
  } else if (confirmar_contrasena !== contrasena) {
    errors.confirmar_contrasena = "Las contraseñas no coinciden.";
  }

  return errors;
}

export default function Registro() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    documento: "",
    telefono: "",
    direccion: "",
    correo: "",
    contrasena: "",
    confirmar_contrasena: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleField = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (serverError) setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setSuccessMsg("");

    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const data = await authService.register({
        nombres: form.nombres.trim(),
        apellidos: form.apellidos.trim(),
        documento: form.documento.trim(),
        telefono: form.telefono.trim(),
        direccion: form.direccion.trim(),
        correo: form.correo.trim(),
        contrasena: form.contrasena,
        confirmar_contrasena: form.confirmar_contrasena,
        tipo_cuenta: "AHORROS",
      });

      setSuccessMsg(
        `¡Bienvenido ${data?.cliente?.nombres || form.nombres}! Tu cuenta bancaria N° ${data?.cuenta?.numero_cuenta || ""} ha sido creada con éxito. Redirigiendo al inicio de sesión...`
      );
      setTimeout(() => {
        navigate("/login");
      }, 2200);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        const detail = err.response.data.detail;
        if (typeof detail === "string") {
          setServerError(detail);
        } else if (Array.isArray(detail)) {
          setServerError(detail[0]?.msg || "Datos inválidos en el formulario.");
        } else {
          setServerError("Ocurrió un error al procesar el registro.");
        }
      } else {
        setServerError("Error de conexión con el backend bancario. Comprueba que el servidor esté activo.");
      }
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
          <p className="rg-brand__card-amount tabular">$ 0,00</p>
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
          <p className="rg-form__subtitle">
            Completa tus datos personales y de acceso para abrir tu cuenta bancaria.
          </p>

          {/* MENSAJES DE ALERTA DEL SERVIDOR */}
          {serverError && (
            <div className="rg-alert rg-alert--error" role="alert">
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: "1px" }} />
              <span>{serverError}</span>
            </div>
          )}

          {successMsg && (
            <div className="rg-alert rg-alert--success" role="status">
              <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: "1px" }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* NOMBRES Y APELLIDOS */}
          <div className="rg-grid-2">
            <div className="rg-field">
              <label htmlFor="nombres" className="rg-field__label">
                Nombres
              </label>
              <div
                className={`rg-field__control ${
                  errors.nombres ? "rg-field__control--error" : ""
                }`}
              >
                <User size={16} className="rg-field__icon" />
                <input
                  id="nombres"
                  name="nombres"
                  type="text"
                  autoComplete="given-name"
                  placeholder="Ej: Juan de Jesús"
                  value={form.nombres}
                  onChange={handleField("nombres")}
                  aria-invalid={!!errors.nombres}
                  aria-describedby={errors.nombres ? "nombres-error" : undefined}
                />
              </div>
              {errors.nombres && (
                <p id="nombres-error" className="rg-field__error" role="alert">
                  {errors.nombres}
                </p>
              )}
            </div>

            <div className="rg-field">
              <label htmlFor="apellidos" className="rg-field__label">
                Apellidos
              </label>
              <div
                className={`rg-field__control ${
                  errors.apellidos ? "rg-field__control--error" : ""
                }`}
              >
                <User size={16} className="rg-field__icon" />
                <input
                  id="apellidos"
                  name="apellidos"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Ej: Pérez Gómez"
                  value={form.apellidos}
                  onChange={handleField("apellidos")}
                  aria-invalid={!!errors.apellidos}
                  aria-describedby={errors.apellidos ? "apellidos-error" : undefined}
                />
              </div>
              {errors.apellidos && (
                <p id="apellidos-error" className="rg-field__error" role="alert">
                  {errors.apellidos}
                </p>
              )}
            </div>
          </div>

          {/* DOCUMENTO Y TELÉFONO */}
          <div className="rg-grid-2">
            <div className="rg-field">
              <label htmlFor="documento" className="rg-field__label">
                N° de Documento
              </label>
              <div
                className={`rg-field__control ${
                  errors.documento ? "rg-field__control--error" : ""
                }`}
              >
                <CreditCard size={16} className="rg-field__icon" />
                <input
                  id="documento"
                  name="documento"
                  type="text"
                  placeholder="Ej: 1077123456"
                  value={form.documento}
                  onChange={handleField("documento")}
                  aria-invalid={!!errors.documento}
                  aria-describedby={errors.documento ? "documento-error" : undefined}
                />
              </div>
              {errors.documento && (
                <p id="documento-error" className="rg-field__error" role="alert">
                  {errors.documento}
                </p>
              )}
            </div>

            <div className="rg-field">
              <label htmlFor="telefono" className="rg-field__label">
                Teléfono móvil
              </label>
              <div
                className={`rg-field__control ${
                  errors.telefono ? "rg-field__control--error" : ""
                }`}
              >
                <Phone size={16} className="rg-field__icon" />
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  autoComplete="tel"
                  placeholder="Ej: 3001234567"
                  value={form.telefono}
                  onChange={handleField("telefono")}
                  aria-invalid={!!errors.telefono}
                  aria-describedby={errors.telefono ? "telefono-error" : undefined}
                />
              </div>
              {errors.telefono && (
                <p id="telefono-error" className="rg-field__error" role="alert">
                  {errors.telefono}
                </p>
              )}
            </div>
          </div>

          {/* DIRECCIÓN */}
          <div className="rg-field">
            <label htmlFor="direccion" className="rg-field__label">
              Dirección de residencia
            </label>
            <div
              className={`rg-field__control ${
                errors.direccion ? "rg-field__control--error" : ""
              }`}
            >
              <MapPin size={16} className="rg-field__icon" />
              <input
                id="direccion"
                name="direccion"
                type="text"
                autoComplete="street-address"
                placeholder="Ej: Carrera 4 # 25-10, Quibdó, Chocó"
                value={form.direccion}
                onChange={handleField("direccion")}
                aria-invalid={!!errors.direccion}
                aria-describedby={errors.direccion ? "direccion-error" : undefined}
              />
            </div>
            {errors.direccion && (
              <p id="direccion-error" className="rg-field__error" role="alert">
                {errors.direccion}
              </p>
            )}
          </div>

          {/* CORREO */}
          <div className="rg-field">
            <label htmlFor="correo" className="rg-field__label">
              Correo electrónico
            </label>
            <div
              className={`rg-field__control ${
                errors.correo ? "rg-field__control--error" : ""
              }`}
            >
              <Mail size={16} className="rg-field__icon" />
              <input
                id="correo"
                name="correo"
                type="email"
                autoComplete="email"
                placeholder="tucorreo@ejemplo.com"
                value={form.correo}
                onChange={handleField("correo")}
                aria-invalid={!!errors.correo}
                aria-describedby={errors.correo ? "correo-error" : undefined}
              />
            </div>
            {errors.correo && (
              <p id="correo-error" className="rg-field__error" role="alert">
                {errors.correo}
              </p>
            )}
          </div>

          {/* CONTRASEÑA Y CONFIRMAR CONTRASEÑA */}
          <div className="rg-grid-2">
            <div className="rg-field">
              <label htmlFor="contrasena" className="rg-field__label">
                Contraseña
              </label>
              <div
                className={`rg-field__control ${
                  errors.contrasena ? "rg-field__control--error" : ""
                }`}
              >
                <Lock size={16} className="rg-field__icon" />
                <input
                  id="contrasena"
                  name="contrasena"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  value={form.contrasena}
                  onChange={handleField("contrasena")}
                  aria-invalid={!!errors.contrasena}
                  aria-describedby={errors.contrasena ? "contrasena-error" : undefined}
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
              {errors.contrasena && (
                <p id="contrasena-error" className="rg-field__error" role="alert">
                  {errors.contrasena}
                </p>
              )}
            </div>

            <div className="rg-field">
              <label htmlFor="confirmar_contrasena" className="rg-field__label">
                Confirmar contraseña
              </label>
              <div
                className={`rg-field__control ${
                  errors.confirmar_contrasena ? "rg-field__control--error" : ""
                }`}
              >
                <Lock size={16} className="rg-field__icon" />
                <input
                  id="confirmar_contrasena"
                  name="confirmar_contrasena"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repite tu contraseña"
                  value={form.confirmar_contrasena}
                  onChange={handleField("confirmar_contrasena")}
                  aria-invalid={!!errors.confirmar_contrasena}
                  aria-describedby={
                    errors.confirmar_contrasena ? "confirmar_contrasena-error" : undefined
                  }
                />
                <button
                  type="button"
                  className="rg-field__toggle"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  aria-label={
                    showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmar_contrasena && (
                <p
                  id="confirmar_contrasena-error"
                  className="rg-field__error"
                  role="alert"
                >
                  {errors.confirmar_contrasena}
                </p>
              )}
            </div>
          </div>

          <button type="submit" className="rg-submit" disabled={submitting}>
            {submitting ? "Creando tu cuenta bancaria…" : "Abrir mi cuenta"}
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
