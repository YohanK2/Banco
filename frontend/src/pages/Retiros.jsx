import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, History, ShieldCheck } from 'lucide-react';
import Sidebar from '../components/Sidebar.jsx';
import Topbar from '../components/Topbar.jsx';
import { useProfile } from '../hooks/useProfile';
import { fetchProfile } from '../services/auth';
import * as transactionService from '../services/transactions';
import '../assets/styles/retiros.css';

const formatCOP = (value) => {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(num);
};

const formatFecha = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d);
};

const initialForm = { monto: '' };

export default function Retiros() {
  const { profile } = useProfile();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [step, setStep] = useState('form');
  const [submitting, setSubmitting] = useState(false);
  const [saldoActual, setSaldoActual] = useState(null);
  const [retiros, setRetiros] = useState([]);
  const [loadingRetiros, setLoadingRetiros] = useState(true);

  const cuenta = profile?.cuenta;

  const saldoDisponible = cuenta ? Number(saldoActual ?? cuenta.saldo) : 0;
  const numeroCuenta = cuenta?.numero_cuenta || '';
  const lastFour = numeroCuenta ? numeroCuenta.slice(-4) : '????';
  const cuentaLabel = `Cuenta ${cuenta?.tipo || 'de ahorros'} •••• ${lastFour}`;
  const cuentaShort = `${(cuenta?.tipo || 'AHORROS').toUpperCase()} •••• ${lastFour}`;

  const loadRetiros = useCallback(async () => {
    const idCuenta = profile?.cuenta?.id_cuenta;
    if (!idCuenta) {
      setRetiros([]);
      setLoadingRetiros(false);
      return;
    }
    setLoadingRetiros(true);
    try {
      const movimientos = await transactionService.getAccountTransactions(idCuenta);
      setRetiros(
        (Array.isArray(movimientos) ? movimientos : [])
          .filter((m) => m.tipo === 'RETIRO')
          .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
          .slice(0, 5)
      );
    } catch {
      setRetiros([]);
    } finally {
      setLoadingRetiros(false);
    }
  }, [profile?.cuenta?.id_cuenta]);

  useEffect(() => {
    loadRetiros();
  }, [loadRetiros]);

  const handleChange = (field) => (e) => {
    let value = e.target.value;
    if (field === 'monto') value = value.replace(/[^\d]/g, '');
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const montoNum = Number(form.monto) || 0;
  const saldoRestante = Math.max(saldoDisponible - montoNum, 0);
  const saldoInsuficiente = montoNum > 0 && montoNum > saldoDisponible;

  const validate = () => {
    const next = {};
    if (!form.monto || montoNum <= 0) {
      next.monto = 'Ingresa un monto mayor a 0.';
    } else if (saldoInsuficiente) {
      next.monto = 'El monto supera tu saldo disponible.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleContinuar = (e) => {
    e.preventDefault();
    setServerError('');
    if (validate()) setStep('confirm');
  };

  const handleConfirmar = async () => {
    setSubmitting(true);
    setServerError('');
    try {
      await transactionService.withdraw({
        numero_cuenta: cuenta?.numero_cuenta,
        monto: montoNum,
        descripcion: 'Retiro desde banca digital',
      });
      try {
        const updated = await fetchProfile();
        if (updated?.cuenta) setSaldoActual(Number(updated.cuenta.saldo));
      } catch {
        if (cuenta) setSaldoActual(saldoRestante);
      }
      loadRetiros();
      setStep('success');
    } catch (err) {
      setServerError(err.response?.data?.detail || 'Error al procesar el retiro.');
      setStep('form');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNuevoRetiro = () => {
    setForm({ monto: '' });
    setErrors({});
    setServerError('');
    setStep('form');
  };

  return (
    <div className="withdraw-page">
      <Sidebar />
      <div className="withdraw-body">
        <Topbar title="Retiros" />

        <div className="withdraw-grid">
          <section className="withdraw-card">
            {step !== 'success' && (
              <>
                <h1 className="withdraw-title">Nuevo retiro</h1>
                <p className="withdraw-subtitle">Retira dinero de tu cuenta Banchocó.</p>

                {serverError && (
                  <p className="server-error-text">{serverError}</p>
                )}

                <form onSubmit={handleContinuar} noValidate>
                  <div className="field">
                    <label htmlFor="cuenta">Cuenta</label>
                    <input
                      id="cuenta"
                      type="text"
                      value={cuentaLabel}
                      readOnly
                      className="input"
                      style={{ background: '#f5f7fa', cursor: 'default' }}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="monto">Monto</label>
                    <input
                      id="monto"
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={form.monto ? formatCOP(form.monto) : ''}
                      onChange={handleChange('monto')}
                      className={
                        errors.monto || saldoInsuficiente
                          ? 'input input-error'
                          : 'input'
                      }
                    />
                    {errors.monto ? (
                      <p className="error-text">{errors.monto}</p>
                    ) : (
                      <p className="hint-text">
                        Saldo disponible: {formatCOP(saldoDisponible)}
                      </p>
                    )}
                  </div>

                  {saldoInsuficiente && (
                    <div className="insufficient-alert" role="alert">
                      <AlertCircle size={17} />
                      <div>
                        <strong>Saldo insuficiente</strong>
                        <p>
                          El monto solicitado supera el saldo disponible de{' '}
                          {formatCOP(saldoDisponible)}.
                        </p>
                      </div>
                    </div>
                  )}

                  {step === 'form' && (
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={!cuenta || !form.monto || saldoInsuficiente}
                    >
                      Retirar
                    </button>
                  )}
                </form>
              </>
            )}

            {step === 'success' && (
              <div className="success-state">
                <div className="success-icon">
                  <svg
                    viewBox="0 0 24 24"
                    width="28"
                    height="28"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h2 className="success-title">Retiro realizado</h2>
                <p className="success-subtitle">
                  Retiraste {formatCOP(montoNum)} de tu{' '}
                  {cuentaLabel.toLowerCase()}.
                </p>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleNuevoRetiro}
                >
                  Nuevo retiro
                </button>
              </div>
            )}
          </section>

          <div className="withdraw-side">
            <aside className={`receipt-card ${step}`}>
              <div className="receipt-wave" />
              <p className="receipt-label">Vas a retirar</p>
              <p className="receipt-amount">
                -{form.monto ? formatCOP(form.monto) : formatCOP(0)}
              </p>

              <div className="receipt-divider" />

              <div className="receipt-row">
                <span>Cuenta</span>
                <strong>{cuentaLabel}</strong>
              </div>
              <div className="receipt-row">
                <span>Saldo restante</span>
                <strong>{formatCOP(saldoRestante)}</strong>
              </div>

              <p className="receipt-status">
                {step === 'success'
                  ? 'Completado'
                  : step === 'confirm'
                  ? 'Pendiente de confirmación'
                  : 'Borrador'}
              </p>

              <div className="secure-banner">
                <ShieldCheck size={18} />
                <div>
                  <strong>Transacción segura</strong>
                  <span>
                    Tu información está protegida con los más altos estándares
                    de seguridad.
                  </span>
                </div>
              </div>
            </aside>

            <section className="tips-card">
              <p>
                Realiza retiros de forma rápida, segura y sin complicaciones.
              </p>
              <a href="#" className="tips-link">
                Conoce más consejos de seguridad <ArrowRight size={14} />
              </a>
            </section>
          </div>
        </div>

        <section className="recent-section">
          <div className="recent-header">
            <h2>
              <History size={18} /> Retiros recientes
            </h2>
            <Link to="/historial" className="recent-all">
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>

          <div className="recent-table-wrap">
            <table className="recent-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Cuenta</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th>Canal</th>
                </tr>
              </thead>
              <tbody>
                {loadingRetiros ? (
                  <tr>
                    <td colSpan="5" className="recent-empty">
                      Cargando retiros...
                    </td>
                  </tr>
                ) : retiros.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="recent-empty">
                      Aún no realizas retiros. Tu primera operación aparecerá
                      aquí.
                    </td>
                  </tr>
                ) : (
                  retiros.map((r) => (
                    <tr key={r.id_transaccion}>
                      <td>{formatFecha(r.fecha)}</td>
                      <td>{cuentaShort}</td>
                      <td className="amount-neg">
                        -{formatCOP(r.monto)}
                      </td>
                      <td>
                        <span className="badge-done">Completado</span>
                      </td>
                      <td>Banca digital</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="withdraw-footer">
          <p>© 2026 Banchocó. Todos los derechos reservados.</p>
          <nav>
            <a href="#">Ayuda</a>
            <a href="#">Términos y condiciones</a>
            <a href="#">Seguridad</a>
            <a href="#">Privacidad</a>
          </nav>
        </footer>
      </div>

      {step === 'confirm' && (
        <div className="confirm-overlay" role="dialog" aria-modal="true">
          <div className="confirm-modal">
            <h2 className="confirm-title">Confirmar retiro</h2>
            <p className="confirm-question">
              ¿Deseas retirar <strong>{formatCOP(montoNum)}</strong> de tu
              cuenta?
            </p>

            <div className="confirm-row">
              <span>Cuenta:</span>
              <strong>{cuentaLabel}</strong>
            </div>
            <div className="confirm-row">
              <span>Saldo después del retiro:</span>
              <strong>{formatCOP(saldoRestante)}</strong>
            </div>

            {serverError && <p className="server-error-text">{serverError}</p>}

            <div className="confirm-actions-modal">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setStep('form')}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-confirm"
                onClick={handleConfirmar}
                disabled={submitting}
              >
                {submitting ? 'Procesando...' : 'Confirmar retiro'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
