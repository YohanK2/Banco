import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRightLeft,
  ShoppingBag,
  Utensils,
  Smartphone,
  Zap,
} from "lucide-react";
import Sidebar from "../components/Sidebar.jsx";
import "../assets/styles/SaldoMovimientos.css";

const fmt = (n) =>
  n.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const MOVIMIENTOS = [
  { id: 1, nombre: "Transferencia recibida · Laura M.", fecha: "Hoy, 9:41 a.m.", monto: 850000, cat: "transfer" },
  { id: 2, nombre: "Supermercado La Colonia", fecha: "Ayer, 6:12 p.m.", monto: -128500, cat: "shopping" },
  { id: 3, nombre: "Restaurante El Fogón", fecha: "Ayer, 1:30 p.m.", monto: -64000, cat: "food" },
  { id: 4, nombre: "Recarga Claro Prepago", fecha: "Lun, 8:05 a.m.", monto: -20000, cat: "phone" },
  { id: 5, nombre: "Pago factura de energía", fecha: "Sáb, 11:00 a.m.", monto: -95300, cat: "utility" },
  { id: 6, nombre: "Transferencia enviada · Carlos R.", fecha: "Vie, 5:30 p.m.", monto: -250000, cat: "transfer" },
];

const ICONOS_CAT = {
  transfer: ArrowRightLeft,
  shopping: ShoppingBag,
  food: Utensils,
  phone: Smartphone,
  utility: Zap,
};

export default function SaldoMovimientos() {
  const [showBalance, setShowBalance] = useState(true);

  const saldo = 4238500;
  const variacion = 2.4;

  return (
    <div className="saldo-page">
      <Sidebar />

      <main className="saldo-main">
        {/* SALUDO */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="greeting"
        >
          <p className="greeting__eyebrow">Tu cuenta</p>
          <h1 className="greeting__title">Saldo y movimientos</h1>
        </motion.div>

        {/* SALDO */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="hero-card"
        >
          <svg className="hero-card__wave" viewBox="0 0 700 160" preserveAspectRatio="none">
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
            <strong>BANCHOCÓ</strong>
          </div>
        </motion.div>

        {/* MOVIMIENTOS */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="movements"
        >
          <div className="movements__header">
            <h2 className="movements__title">Todos los movimientos</h2>
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
                  transition={{ duration: 0.35, delay: 0.18 + i * 0.05 }}
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
    </div>
  );
}
