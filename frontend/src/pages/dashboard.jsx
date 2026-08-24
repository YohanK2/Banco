import React, { useEffect, useState, useCallback } from "react";
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
  ChevronRight,
  Check,
  Loader2,
} from "lucide-react";
import Sidebar from "../components/Sidebar.jsx";
import { useProfile } from "../hooks/useProfile";
import * as transactionService from "../services/transactions";
import "../assets/styles/dashboard.css";

const fmt = (n) =>
  Number(n).toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const TIPO_ICON = {
  DEPOSITO: ArrowUpRight,
  RETIRO: ArrowDownRight,
  TRANSFERENCIA: ArrowRightLeft,
};

const ACCIONES = [
  { id: "transferir", label: "Transferir", icon: ArrowRightLeft, route: "/transferencias" },
  { id: "depositar", label: "Depositar", icon: Plus, route: null },
  { id: "historial", label: "Historial", icon: Receipt, route: "/historial" },
  { id: "movimientos", label: "Más", icon: LayoutGrid, route: "/movimientos" },
];

// Modal simple de depósito inline
function DepositModal({ open, numeroCuenta, onClose, onSuccess }) {
  const [monto, setMonto] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDeposit = async () => {
    const n = Number(monto.replace(/\D/g, ""));
    if (!n || n <= 0) { setError("Ingresa un monto válido mayor a 0."); return; }
    setLoading(true);
    setError("");
    try {
      await transactionService.deposit({ numero_cuenta: numeroCuenta, monto: n, descripcion: "Depósito desde dashboard" });
      setMonto("");
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Error al realizar el depósito.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="modal"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__icon"><Check size={26} color="#12B76A" strokeWidth={2.5} /></div>
        <h3 className="modal__title">Depositar dinero</h3>
        <p className="modal__text">Ingresa el monto que deseas depositar en tu cuenta.</p>
        <input
          type="text"
          inputMode="numeric"
          placeholder="$ 0"
          value={monto ? `$ ${Number(monto.replace(/\D/g, "")).toLocaleString("es-CO")}` : ""}
          onChange={(e) => setMonto(e.target.value.replace(/\D/g, ""))}
          style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #dde1eb", fontSize: "1.1rem", marginBottom: "8px", boxSizing: "border-box" }}
        />
        {error && <p style={{ color: "#b00020", fontSize: "0.82rem", marginBottom: "8px" }}>{error}</p>}
        <div className="modal__actions">
          <button onClick={onClose} className="modal__btn modal__btn--ghost" disabled={loading}>Cancelar</button>
          <button onClick={handleDeposit} className="modal__btn modal__btn--solid" disabled={loading}>
            {loading ? "Procesando…" : "Confirmar depósito"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function BankDashboard() {
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);

  const { profile, loading: profileLoading } = useProfile();
  const [account, setAccount] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);

  const cliente = profile?.cliente;
  const cuenta = profile?.cuenta;
  const cuentas = profile?.cuentas;
  const firstName = cliente?.nombres?.split(" ")[0] || "Usuario";

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (cuenta?.id_cuenta) {
        const txs = await transactionService.getAccountTransactions(cuenta.id_cuenta);
        setMovimientos(txs.slice(0, 5));
      }
    } catch (err) {
      console.error("Error cargando datos del dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, [cuenta?.id_cuenta]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saldo = cuenta ? Number(cuenta.saldo) : 0;
  const numeroCuenta = cuenta?.numero_cuenta || "";
  const lastFour = numeroCuenta ? numeroCuenta.slice(-4) : "••••";

  const handleAccionClick = (accion) => {
    if (accion.route) {
      navigate(accion.route);
    } else if (accion.id === "depositar") {
      setShowDepositModal(true);
    }
  };

  const formatMovimiento = (m) => {
    const esIngreso = m.tipo === "DEPOSITO" || (m.tipo === "TRANSFERENCIA" && m.cuenta_destino === cuenta?.id_cuenta);
    return { ...m, esIngreso };
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <main className="main">
        {/* TOPBAR COMPARTIDO */}
        <Topbar title="Resumen" />

        {/* SALUDO */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="greeting"
        >
          <p className="greeting__eyebrow">Bienvenido de nuevo</p>
          <h1 className="greeting__title">Hola, {firstName} 👋</h1>
        </motion.div>

        {/* TARJETA DE SALDO */}
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
              <div className="card-chip-row">
                <div className="card-chip">
                  <div className="card-chip__grid">
                    <div className="card-chip__cell" />
                    <div className="card-chip__cell" />
                    <div className="card-chip__cell" />
                    <div className="card-chip__cell" />
                  </div>
                </div>
                <span className="card-number tabular">•••• •••• •••• {lastFour}</span>
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
                    {loading ? "Cargando…" : showBalance ? `$ ${fmt(saldo)}` : "$ •••••••"}
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

              {!loading && (
                <div className="balance-trend">
                  <TrendingUp size={12} />
                  Cuenta {cuenta?.tipo || "AHORROS"}
                </div>
              )}
            </div>
          </div>

          <div className="hero-card__footer">
            <span>Cuenta de ahorros</span>
            <strong>BANCHOCÓ</strong>
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
                onClick={() => handleAccionClick(a)}
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
            <button className="movements__link" onClick={() => navigate("/historial")}>
              Ver todos <ChevronRight size={15} />
            </button>
          </div>

          {loading ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "24px 0", color: "#94A0B4" }}>
              <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
              <span>Cargando movimientos…</span>
            </div>
          ) : movimientos.length === 0 ? (
            <p style={{ color: "#94A0B4", fontSize: "0.9rem", padding: "16px 0" }}>
              Aún no hay movimientos. ¡Realiza tu primer depósito!
            </p>
          ) : (
            <div>
              {movimientos.map((m, i) => {
                const fm = formatMovimiento(m);
                const Icon = TIPO_ICON[m.tipo] || ArrowRightLeft;
                const positivo = fm.esIngreso;
                return (
                  <motion.div
                    key={m.id_transaccion}
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
                        <p className="movement__name">
                          {m.descripcion || m.tipo}
                        </p>
                        <p className="movement__date">
                          {new Date(m.fecha).toLocaleString("es-CO", {
                            day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
                          })}
                        </p>
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
                        {positivo ? "+" : "-"} ${fmt(Math.abs(Number(m.monto)))}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </main>

      <DepositModal
        open={showDepositModal}
        numeroCuenta={numeroCuenta}
        onClose={() => setShowDepositModal(false)}
        onSuccess={loadData}
      />
    </div>
  );
}

function Topbar({ title }) {
  return (
    <header className="topbar">
      <h1>{title}</h1>
    </header>
  );
}