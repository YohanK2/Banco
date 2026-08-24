import { useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import Topbar from '../components/Topbar.jsx';
import { useNotifications } from '../context/NotificationsContext.jsx';
import '../assets/styles/topbar.css';
import '../assets/styles/retiros.css';

const formatCOP = (value) => {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(num);
};

// En un proyecto real esto vendría del backend / contexto de sesión
const cuentasDisponibles = [
  { id: '1', label: 'Cuenta de ahorros •••• 4521', saldo: 850000 },
];

const initialForm = {
  cuenta: cuentasDisponibles[0]?.id ?? '',
  monto: '',
};

export default function Retiros() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState('form'); // 'form' | 'confirm' | 'success'
  const [submitting, setSubmitting] = useState(false);
  const { pushNotification } = useNotifications();

  const cuentaSeleccionada = cuentasDisponibles.find((c) => c.id === form.cuenta);
  const saldoDisponible = cuentaSeleccionada?.saldo ?? 0;

  const handleChange = (field) => (e) => {
    let value = e.target.value;
    if (field === 'monto') {
      value = value.replace(/[^\d]/g, '');
    }
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.cuenta) {
      next.cuenta = 'Selecciona una cuenta.';
    }
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
    if (validate()) setStep('confirm');
  };

  const handleConfirmar = async () => {
    setSubmitting(true);
    // Aquí se conecta con el servicio real de retiros (API / backend)
    await new Promise((resolve) => setTimeout(resolve, 900));
    setSubmitting(false);
    setStep('success');
    pushNotification({
      type: 'money_out',
      title: 'Retiraste dinero',
      description: 'Retiro desde tu cuenta Banchocó',
      amount: Number(form.monto) || 0,
    });
  };

  const handleNuevoRetiro = () => {
    setForm({ ...initialForm });
    setErrors({});
    setStep('form');
  };

  const montoNum = Number(form.monto) || 0;
  const saldoRestante = Math.max(saldoDisponible - montoNum, 0);

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

              <form onSubmit={handleContinuar} noValidate>
                <div className="field">
                  <label htmlFor="cuenta">Cuenta</label>
                  <select
                    id="cuenta"
                    value={form.cuenta}
                    onChange={handleChange('cuenta')}
                    disabled={step === 'confirm'}
                    className={errors.cuenta ? 'input input-error' : 'input'}
                  >
                    {cuentasDisponibles.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  {errors.cuenta && <p className="error-text">{errors.cuenta}</p>}
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
                  <button type="submit" className="btn-primary">
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
                Retiraste {formatCOP(form.monto)} de tu {cuentaSeleccionada?.label.toLowerCase()}.
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
            <strong>{cuentaSeleccionada?.label ?? '—'}</strong>
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
    </div>
  );
}
