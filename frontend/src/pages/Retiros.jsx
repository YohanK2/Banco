import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import authService from '../services/authService.js';
import accountService from '../services/accountService.js';
import transactionService from '../services/transactionService.js';
import '../assets/styles/retiros.css';

const formatCOP = (value) => {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(num);
};

const initialForm = { monto: '' };

export default function Retiros() {
  const [account, setAccount] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [step, setStep] = useState('form'); // 'form' | 'confirm' | 'success'
  const [submitting, setSubmitting] = useState(false);

  // Cargar cuenta activa al montar
  useEffect(() => {
    const loadAccount = async () => {
      let acc = authService.getActiveAccount();
      if (acc?.id_cuenta) {
        try {
          const fresh = await accountService.getAccountById(acc.id_cuenta);
          acc = fresh;
          authService.setActiveAccount(fresh);
        } catch (_) {}
      }
      setAccount(acc);
    };
    loadAccount();
  }, []);

  const saldoDisponible = account ? Number(account.saldo) : 0;
  const numeroCuenta = account?.numero_cuenta || '';
  const lastFour = numeroCuenta ? numeroCuenta.slice(-4) : '????';
  const cuentaLabel = `Cuenta ${account?.tipo || 'de ahorros'} •••• ${lastFour}`;

  const handleChange = (field) => (e) => {
    let value = e.target.value;
    if (field === 'monto') value = value.replace(/[^\d]/g, '');
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const next = {};
    const montoNum = Number(form.monto);
    if (!form.monto || montoNum <= 0) {
      next.monto = 'Ingresa un monto mayor a 0.';
    } else if (montoNum > saldoDisponible) {
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
        numero_cuenta: numeroCuenta,
        monto: Number(form.monto),
        descripcion: 'Retiro desde banca digital',
      });
      // Actualizar saldo en localStorage
      const fresh = await accountService.getAccountById(account.id_cuenta);
      authService.setActiveAccount(fresh);
      setAccount(fresh);
      setStep('success');
    } catch (err) {
      setServerError(err.response?.data?.detail || 'Error al procesar el retiro.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNuevoRetiro = () => {
    setForm({ ...initialForm });
    setErrors({});
    setServerError('');
    setStep('form');
  };

  const montoNum = Number(form.monto) || 0;
  const saldoRestante = Math.max(saldoDisponible - montoNum, 0);


  return (
    <div className="withdraw-page">
      <Sidebar />
      <div className="withdraw-grid">
        <section className="withdraw-card">
          {step !== 'success' && (
            <>
              <h1 className="withdraw-title">Nuevo retiro</h1>
              <p className="withdraw-subtitle">Retira dinero de tu cuenta Banchocó.</p>

              {serverError && (
                <p style={{ color: '#b00020', background: '#fff0f0', border: '1px solid #f5c2c7', borderRadius: '8px', padding: '10px 14px', fontSize: '0.85rem', marginBottom: '8px' }}>
                  {serverError}
                </p>
              )}

              <form onSubmit={handleContinuar} noValidate>
                <div className="field">
                  <label htmlFor="cuenta">Cuenta</label>
                  <input
                    id="cuenta"
                    type="text"
                    value={account ? cuentaLabel : 'Cargando cuenta…'}
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
                    disabled={step === 'confirm'}
                    className={errors.monto ? 'input input-error' : 'input'}
                  />
                  {errors.monto ? (
                    <p className="error-text">{errors.monto}</p>
                  ) : (
                    <p className="hint-text">Saldo disponible: {formatCOP(saldoDisponible)}</p>
                  )}
                </div>

                {step === 'form' && (
                  <button type="submit" className="btn-primary" disabled={!account}>
                    Retirar
                  </button>
                )}
              </form>

              {step === 'confirm' && (
                <div className="confirm-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setStep('form')}
                    disabled={submitting}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={handleConfirmar}
                    disabled={submitting}
                  >
                    {submitting ? 'Procesando...' : 'Confirmar retiro'}
                  </button>
                </div>
              )}
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
                Retiraste {formatCOP(form.monto)} de tu {cuentaLabel.toLowerCase()}.
              </p>
              <button type="button" className="btn-primary" onClick={handleNuevoRetiro}>
                Nuevo retiro
              </button>
            </div>
          )}

        </section>

        <aside className={`receipt-card ${step}`}>
          <div className="receipt-wave" />
          <p className="receipt-label">Vas a retirar</p>
          <p className="receipt-amount">-{form.monto ? formatCOP(form.monto) : formatCOP(0)}</p>

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
        </aside>
      </div>
    </div>
  );
}
