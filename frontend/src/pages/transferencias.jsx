import { useState } from 'react';
import MareaNavbar from '../components/Navbar.jsx';
import '../assets/styles/transferencias.css';

const formatCOP = (value) => {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(num);
};

const initialForm = {
  cuentaDestino: '',
  nombreDestinatario: '',
  monto: '',
  descripcion: '',
};

export default function Transferencias() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState('form'); // 'form' | 'confirm' | 'success'
  const [submitting, setSubmitting] = useState(false);

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
    if (!form.cuentaDestino.trim()) {
      next.cuentaDestino = 'La cuenta destino es obligatoria.';
    }
    if (!form.nombreDestinatario.trim()) {
      next.nombreDestinatario = 'El nombre del destinatario es obligatorio.';
    }
    const montoNum = Number(form.monto);
    if (!form.monto || montoNum <= 0) {
      next.monto = 'Ingresa un monto mayor a 0.';
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
    // Aquí se conecta con el servicio real de transferencias (API / backend)
    await new Promise((resolve) => setTimeout(resolve, 900));
    setSubmitting(false);
    setStep('success');
  };

  const handleNuevaTransferencia = () => {
    setForm(initialForm);
    setErrors({});
    setStep('form');
  };

  return (
    <div className="transfer-page">
      <MareaNavbar />
      <div className="transfer-grid">
        <section className="transfer-card">
          {step !== 'success' && (
            <>
              <h1 className="transfer-title">Nueva transferencia</h1>
              <p className="transfer-subtitle">Envía dinero a otra cuenta Banchocó.</p>

              <form onSubmit={handleContinuar} noValidate>
                <div className="field">
                  <label htmlFor="cuentaDestino">Cuenta destino</label>
                  <input
                    id="cuentaDestino"
                    type="text"
                    inputMode="numeric"
                    placeholder="Número de cuenta"
                    value={form.cuentaDestino}
                    onChange={handleChange('cuentaDestino')}
                    disabled={step === 'confirm'}
                    className={errors.cuentaDestino ? 'input input-error' : 'input'}
                  />
                  {errors.cuentaDestino && <p className="error-text">{errors.cuentaDestino}</p>}
                </div>

                <div className="field">
                  <label htmlFor="nombreDestinatario">Nombre del destinatario</label>
                  <input
                    id="nombreDestinatario"
                    type="text"
                    placeholder="Nombre completo"
                    value={form.nombreDestinatario}
                    onChange={handleChange('nombreDestinatario')}
                    disabled={step === 'confirm'}
                    className={errors.nombreDestinatario ? 'input input-error' : 'input'}
                  />
                  {errors.nombreDestinatario && (
                    <p className="error-text">{errors.nombreDestinatario}</p>
                  )}
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
                  {errors.monto && <p className="error-text">{errors.monto}</p>}
                </div>

                <div className="field">
                  <label htmlFor="descripcion">
                    Descripción <span className="optional">(opcional)</span>
                  </label>
                  <textarea
                    id="descripcion"
                    placeholder="Ej. Pago de arriendo"
                    value={form.descripcion}
                    onChange={handleChange('descripcion')}
                    disabled={step === 'confirm'}
                    className="textarea"
                    rows={3}
                  />
                </div>

                {step === 'form' && (
                  <button type="submit" className="btn-primary">
                    Transferir
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
                    className="btn-primary"
                    onClick={handleConfirmar}
                    disabled={submitting}
                  >
                    {submitting ? 'Procesando...' : 'Confirmar transferencia'}
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
              <h2 className="success-title">Transferencia realizada</h2>
              <p className="success-subtitle">
                Enviaste {formatCOP(form.monto)} a {form.nombreDestinatario}.
              </p>
              <button type="button" className="btn-primary" onClick={handleNuevaTransferencia}>
                Nueva transferencia
              </button>
            </div>
          )}
        </section>

        <aside className={`receipt-card ${step}`}>
          <div className="receipt-wave" />
          <p className="receipt-label">Comprobante</p>
          <p className="receipt-amount">{form.monto ? formatCOP(form.monto) : formatCOP(0)}</p>

          <div className="receipt-divider" />

          <div className="receipt-row">
            <span>Cuenta destino</span>
            <strong>{form.cuentaDestino || '—'}</strong>
          </div>
          <div className="receipt-row">
            <span>Destinatario</span>
            <strong>{form.nombreDestinatario || '—'}</strong>
          </div>
          <div className="receipt-row">
            <span>Descripción</span>
            <strong>{form.descripcion || 'Sin descripción'}</strong>
          </div>

          <div className="receipt-perforation" aria-hidden="true">
            {Array.from({ length: 18 }).map((_, i) => (
              <span key={i} />
            ))}
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