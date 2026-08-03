import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  ArrowRightLeft,
  Plus,
  Receipt,
  LayoutGrid,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingBag,
  Utensils,
  Zap,
  Smartphone,
  Check,
  ChevronRight,
} from "lucide-react";
import MareaNavbar from "../components/Navbar.jsx";
import "../assets/styles/dashboard.css";

/*
  MAREA — dashboard bancario
  --------------------------------------------------
  Los estilos viven en BankDashboard.css (variables de color,
  tipografía, layout). Este archivo solo maneja estructura,
  estado y las animaciones de framer-motion.

  Nota de integración:
    En tu proyecto real, reemplaza <ConfirmModal> por Swal.fire(...)
    de 'sweetalert2' (ya la tienes instalada). El array ACCIONES ya
    trae los textos (title / text) listos para pasar directo al
    objeto de opciones de Swal.
*/

const fmt = (n) =>
  n.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const MOVIMIENTOS = [
  { id: 1, nombre: "Transferencia recibida · Laura M.", fecha: "Hoy, 9:41 a.m.", monto: 850000, cat: "transfer" },
  { id: 2, nombre: "Supermercado La Colonia", fecha: "Ayer, 6:12 p.m.", monto: -128500, cat: "shopping" },
  { id: 3, nombre: "Restaurante El Fogón", fecha: "Ayer, 1:30 p.m.", monto: -64000, cat: "food" },
  { id: 4, nombre: "Recarga Claro Prepago", fecha: "Lun, 8:05 a.m.", monto: -20000, cat: "phone" },
  { id: 5, nombre: "Pago factura de energía", fecha: "Sáb, 11:00 a.m.", monto: -95300, cat: "utility" },
];

const ICONOS_CAT = {
  transfer: ArrowRightLeft,
  shopping: ShoppingBag,
  food: Utensils,
  phone: Smartphone,
  utility: Zap,
};

const ACCIONES = [
  {
    id: "transferir",
    label: "Transferir",
    icon: ArrowRightLeft,
    title: "Transferir dinero",
    text: "Vas a iniciar una transferencia desde tu cuenta de ahorros. ¿Deseas continuar?",
  },
  {
    id: "recargar",
    label: "Recargar",
    icon: Plus,
    title: "Recargar celular",
    text: "Elige el número y el operador para tu recarga en el siguiente paso.",
  },
  {
    id: "pagar",
    label: "Pagar servicios",
    icon: Receipt,
    title: "Pagar servicios",
    text: "Podrás buscar tu factura por empresa o número de referencia.",
  },
  {
    id: "mas",
    label: "Más",
    icon: LayoutGrid,
    title: "Todas las operaciones",
    text: "Aquí encontrarás el resto de funciones: seguros, inversiones y más.",
  },
];

function ConfirmModal({ open, data, onClose }) {
  if (!data) return null;
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal__icon">
              <Check size={26} color="#12B76A" strokeWidth={2.5} />
            </div>
            <h3 className="modal__title">{data.title}</h3>
            <p className="modal__text">{data.text}</p>
            <div className="modal__actions">
              <button onClick={onClose} className="modal__btn modal__btn--ghost">
                Cancelar
              </button>
              <button onClick={onClose} className="modal__btn modal__btn--solid">
                Continuar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function BankDashboard() {
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);
  const [modalData, setModalData] = useState(null);

  const saldo = 4238500;
  const variacion = 2.4;

  return (
    <div className="dashboard">
      {/* NAVBAR */}
      <MareaNavbar />

      <main className="main">
        {/* SALUDO */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="greeting"
        >
          <p className="greeting__eyebrow">Bienvenido de nuevo</p>
          <h1 className="greeting__title">Tu resumen de cuenta</h1>
        </motion.div>

        {/* TARJETA DE SALDO — elemento firma */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="hero-card"
        >
          <svg
            className="hero-card__wave"
            viewBox="0 0 700 160"
            preserveAspectRatio="none"
          >
            <motion.path
              d="M0,80 C120,20 220,140 350,80 C480,20 580,140 700,80 L700,160 L0,160 Z"
              fill="#F2A93B"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.3 }}
            />
          </svg>

          <div className="hero-card__content">
            <div>
              <div className="card-chip-row">
                <div className="card-chip">
                  <div className="card-chip__grid">
                    <div className="card-chip__cell" />
                    <div className="card-chip__cell" />
                    <div className="card-chip__cell" />
                    <div className="card-chip__cell" />
                  </div>
                </div>
                <span className="card-number tabular">•••• •••• •••• 4821</span>
              </div>

              <p className="balance-label">Saldo disponible</p>

              <div className="balance-row">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={showBalance ? "shown" : "hidden"}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                    className="balance-amount tabular"
                  >
                    {showBalance ? `$ ${fmt(saldo)}` : "$ •••••••"}
                  </motion.span>
                </AnimatePresence>
                <button
                  onClick={() => setShowBalance((s) => !s)}
                  className="balance-toggle"
                  aria-label={showBalance ? "Ocultar saldo" : "Mostrar saldo"}
                >
                  {showBalance ? <Eye size={16} color="#A9B3CC" /> : <EyeOff size={16} color="#A9B3CC" />}
                </button>
              </div>

              <div className="balance-trend">
                <TrendingUp size={12} />
                +{variacion}% este mes
              </div>
            </div>
          </div>

          <div className="hero-card__footer">
            <span>Cuenta de ahorros</span>
            <strong>MAREA</strong>
          </div>
        </motion.div>

        {/* ACCESOS RÁPIDOS */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="quick-actions"
        >
          {ACCIONES.map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.id}
                onClick={() => (a.id === "transferir" ? navigate("/transferencias") : setModalData(a))}
                className="quick-action"
              >
                <div className="quick-action__icon">
                  <Icon size={17} color="#0B3D2E" />
                </div>
                <span className="quick-action__label">{a.label}</span>
              </button>
            );
          })}
        </motion.div>

        {/* MOVIMIENTOS RECIENTES */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.22 }}
          className="movements"
        >
          <div className="movements__header">
            <h2 className="movements__title">Movimientos recientes</h2>
            <button className="movements__link">
              Ver todos <ChevronRight size={15} />
            </button>
          </div>

          <div>
            {MOVIMIENTOS.map((m, i) => {
              const Icon = ICONOS_CAT[m.cat];
              const positivo = m.monto > 0;
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.3 + i * 0.05 }}
                  className="movement"
                >
                  <div className="movement__left">
                    <div className={`movement__icon ${positivo ? "movement__icon--in" : "movement__icon--out"}`}>
                      <Icon size={16} color={positivo ? "#12B76A" : "#0B3D2E"} />
                    </div>
                    <div>
                      <p className="movement__name">{m.nombre}</p>
                      <p className="movement__date">{m.fecha}</p>
                    </div>
                  </div>

                  <div className="movement__amount">
                    {positivo ? (
                      <ArrowUpRight size={14} color="#12B76A" />
                    ) : (
                      <ArrowDownRight size={14} color="#F0655A" />
                    )}
                    <span
                      className={`movement__amount-value tabular ${
                        positivo ? "movement__amount-value--in" : "movement__amount-value--out"
                      }`}
                    >
                      {positivo ? "+" : "-"} ${fmt(Math.abs(m.monto))}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </main>

      <ConfirmModal open={!!modalData} data={modalData} onClose={() => setModalData(null)} />
    </div>
  );
}