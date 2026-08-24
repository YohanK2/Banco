import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRightLeft,
  Loader2,
} from "lucide-react";
import Sidebar from "../components/Sidebar.jsx";
import { useProfile } from "../hooks/useProfile";
import * as transactionService from "../services/transactions";
import "../assets/styles/SaldoMovimientos.css";

const fmt = (n) =>
  Number(n).toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const TIPO_ICON = {
  DEPOSITO: ArrowUpRight,
  RETIRO: ArrowDownRight,
  TRANSFERENCIA: ArrowRightLeft,
};

export default function SaldoMovimientos() {
  const { profile, loading: profileLoading } = useProfile();
  const [showBalance, setShowBalance] = useState(true);
  const [account, setAccount] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const cuenta = profile?.cuenta;
      if (cuenta?.id_cuenta) {
        const statement = await transactionService.getAccountStatement(cuenta.id_cuenta);
        setAccount(statement.cuenta);
        setMovimientos(statement.movimientos || []);
      }
    } catch (err) {
      console.error("Error cargando saldo y movimientos:", err);
    } finally {
      setLoading(false);
    }
  }, [profile?.cuenta?.id_cuenta]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const cuenta = profile?.cuenta;
  const saldo = cuenta ? Number(cuenta.saldo) : 0;
  const numeroCuenta = cuenta?.numero_cuenta || "";
  const lastFour = numeroCuenta ? numeroCuenta.slice(-4) : "••••";

  return (
    <div className="saldo-page">
      <Sidebar />

      <main className="saldo-main">
        <Topbar title="Saldo y movimientos" />

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="greeting"
        >
          <p className="greeting__eyebrow">Tu cuenta</p>
          <h1 className="greeting__title">Saldo y movimientos</h1>
        </motion.div>

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

              {!loading && cuenta && (
                <div className="balance-trend">
                  <TrendingUp size={12} />
                  Cuenta {cuenta.tipo || "AHORROS"} · •••• {cuenta.numero_cuenta?.slice(-4)}
                </div>
              )}
            </div>
          </div>

          <div className="hero-card__footer">
            <span>Cuenta de ahorros</span>
            <strong>BANCHOCÓ</strong>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="movements"
        >
          <div className="movements__header">
            <h2 className="movements__title">Todos los movimientos</h2>
          </div>

          {loading ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "24px 0", color: "#94A0B4" }}>
              <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
              <span>Cargando movimientos…</span>
            </div>
          ) : movimientos.length === 0 ? (
            <p style={{ color: "#94A0B4", fontSize: "0.9rem", padding: "16px 0" }}>
              Aún no hay movimientos en esta cuenta.
            </p>
          ) : (
            <div>
              {movimientos.map((m, i) => {
                const esIngreso = m.tipo === "DEPOSITO" || (m.tipo === "TRANSFERENCIA" && m.cuenta_destino === profile?.cuenta?.id_cuenta);
                const Icon = TIPO_ICON[m.tipo] || ArrowRightLeft;
                return (
                  <motion.div
                    key={m.id_transaccion}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: 0.18 + i * 0.05 }}
                    className="movement"
                  >
                    <div className="movement__left">
                      <div className={`movement__icon ${esIngreso ? "movement__icon--in" : "movement__icon--out"}`}>
                        <Icon size={16} color={esIngreso ? "#12B76A" : "#0B3D2E"} />
                      </div>
                      <div>
                        <p className="movement__name">{m.descripcion || m.tipo}</p>
                        <p className="movement__date">
                          {new Date(m.fecha).toLocaleString("es-CO", {
                            day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="movement__amount">
                      {esIngreso ? (
                        <ArrowUpRight size={14} color="#12B76A" />
                      ) : (
                        <ArrowDownRight size={14} color="#F0655A" />
                      )}
                      <span
                        className={`movement__amount-value tabular ${
                          esIngreso ? "movement__amount-value--in" : "movement__amount-value--out"
                        }`}
                      >
                        {esIngreso ? "+" : "-"} ${fmt(Math.abs(Number(m.monto)))}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </main>
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