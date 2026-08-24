import { useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  ArrowLeftRight,
  CreditCard,
  Landmark,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Star,
  UserPlus,
  Clock,
  CheckCircle2,
  Headphones,
  Calendar,
  Lock,
} from 'lucide-react';
import Sidebar from '../components/Sidebar.jsx';
import Topbar from '../components/Topbar.jsx';
import { useNotifications } from '../context/NotificationsContext.jsx';
import '../assets/styles/transferencias.css';

/*
  BANCHOCÓ BANK — Transferencias
  --------------------------------------------------
  Panel/dashboard con sidebar + topbar. La tarjeta de
  "Nueva transferencia" ocupa todo el ancho (horizontal) y
  debajo van los paneles de Contactos, Actividad y Límites.
  El formulario cambia según el tipo de transferencia:
    - A cuentas Banchocó: buscar contacto / alias.
    - A otros bancos: nombre, banco (o billetera digital),
      tipo de cuenta, número, valor y descripción, con regla
      de dígitos mínimos según el tipo de cuenta destino.

  El sidebar es el componente compartido components/Sidebar.jsx,
  usado también en Resumen, Retiros, etc.
*/

const formatCOP = (value) => {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(num);
};

const TIPOS_TRANSFERENCIA = [
  {
    key: 'banchoco',
    icon: CreditCard,
    title: 'A cuentas Banchocó',
    text: 'Cuentas propias o de otros usuarios',
  },
  {
    key: 'ach',
    icon: Landmark,
    title: 'A otros bancos',
    text: 'ACH / PSE',
  },
];

// Bancos y billeteras digitales de Colombia.
// minDigitos es la regla de dígitos mínimos del número destino:
// las billeteras usan número de celular (10 dígitos) y los
// bancos el mínimo propio de número de cuenta.
const BANCOS_COLOMBIA = [
  { id: 'bancolombia', nombre: 'Bancolombia', tipo: 'banco', minDigitos: 11 },
  { id: 'davivienda', nombre: 'Davivienda', tipo: 'banco', minDigitos: 10 },
  { id: 'bbva', nombre: 'BBVA', tipo: 'banco', minDigitos: 10 },
  { id: 'bogota', nombre: 'Banco de Bogotá', tipo: 'banco', minDigitos: 10 },
  { id: 'popular', nombre: 'Banco Popular', tipo: 'banco', minDigitos: 10 },
  { id: 'occidente', nombre: 'Banco de Occidente', tipo: 'banco', minDigitos: 10 },
  { id: 'avvillas', nombre: 'Banco AV Villas', tipo: 'banco', minDigitos: 10 },
  { id: 'colpatria', nombre: 'Scotiabank Colpatria', tipo: 'banco', minDigitos: 10 },
  { id: 'caja_social', nombre: 'Banco Caja Social', tipo: 'banco', minDigitos: 10 },
  { id: 'falabella', nombre: 'Banco Falabella', tipo: 'banco', minDigitos: 10 },
  { id: 'itau', nombre: 'Itaú', tipo: 'banco', minDigitos: 10 },
  { id: 'agrario', nombre: 'Banco Agrario', tipo: 'banco', minDigitos: 10 },
  { id: 'pichincha', nombre: 'Banco Pichincha', tipo: 'banco', minDigitos: 10 },
  { id: 'nequi', nombre: 'Nequi', tipo: 'billetera', minDigitos: 10 },
  { id: 'daviplata', nombre: 'DaviPlata', tipo: 'billetera', minDigitos: 10 },
  { id: 'bold', nombre: 'Bold', tipo: 'billetera', minDigitos: 10 },
  { id: 'addi', nombre: 'Addi', tipo: 'billetera', minDigitos: 10 },
  { id: 'movii', nombre: 'Movii', tipo: 'billetera', minDigitos: 10 },
  { id: 'rappi', nombre: 'RappiPay', tipo: 'billetera', minDigitos: 10 },
  { id: 'coink', nombre: 'Coink', tipo: 'billetera', minDigitos: 10 },
  { id: 'lulo', nombre: 'Lulo Bank', tipo: 'billetera', minDigitos: 10 },
];

const CUENTA_ORIGEN = {
  nombre: 'Cuenta Corriente •••• 4589',
  saldo: 7250000,
};

// Bancos disponibles para crear contactos (incluye la propia Banchocó).
const BANCOS_CONTACTO = [
  { id: 'banchoco', nombre: 'Banchocó Bank', tipo: 'banchoco', minDigitos: 10 },
  ...BANCOS_COLOMBIA,
];

const TONES = ['green', 'amber', 'purple', 'blue', 'pink'];

const getInitials = (nombre) =>
  nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || 'U';

const contactoDetalle = (c) => {
  if (c.alias) return `Alias: ${c.alias}`;
  const tipo =
    c.tipoCuenta === 'ahorro'
      ? 'Ahorros'
      : c.tipoCuenta === 'corriente'
        ? 'Corriente'
        : c.tipoCuenta === 'billetera'
          ? 'Celular'
          : 'Cuenta';
  return `${tipo} •••• ${c.numeroCuenta.slice(-4)}`;
};

const QUICK_AMOUNTS = [50000, 100000, 200000];

const CONTACTOS_FRECUENTES = [
  { nombre: 'María Paula', bancoId: 'banchoco', banco: 'Banchocó Bank', tipoCuenta: 'corriente', numeroCuenta: '0045891234', tone: 'green', favorito: true },
  { nombre: 'Juan Andrés', bancoId: 'bancolombia', banco: 'Bancolombia', tipoCuenta: 'ahorro', numeroCuenta: '12345678901', tone: 'amber', favorito: false },
  { nombre: 'Laura Sánchez', bancoId: 'davivienda', banco: 'Davivienda', tipoCuenta: 'corriente', numeroCuenta: '9876543210', tone: 'purple', favorito: false },
  { nombre: 'Carlos Restrepo', bancoId: 'bbva', banco: 'BBVA', tipoCuenta: 'ahorro', numeroCuenta: '1122334455', tone: 'blue', favorito: false },
  { nombre: 'Camila Torres', bancoId: 'nequi', banco: 'Nequi', tipoCuenta: 'billetera', numeroCuenta: '3114567890', alias: 'camilat', tone: 'pink', favorito: false },
];

const ACTIVIDAD_RECIENTE = [
  { icon: ArrowLeftRight, tone: 'blue', titulo: 'Transferencia a María Paula', fecha: 'Hoy, 10:30 a.m.', monto: -200000 },
  { icon: ArrowLeftRight, tone: 'green', titulo: 'Transferencia recibida de Juan Andrés', fecha: 'Ayer, 8:15 p.m.', monto: 350000 },
  { icon: ArrowLeftRight, tone: 'blue', titulo: 'Transferencia a Carlos Restrepo', fecha: 'Ayer, 5:20 p.m.', monto: -150000 },
  { icon: ArrowLeftRight, tone: 'green', titulo: 'Transferencia recibida de Laura Sánchez', fecha: '24 May, 11:05 a.m.', monto: 250000 },
  { icon: Calendar, tone: 'purple', titulo: 'Pago programado - Arriendo', fecha: '24 May, 12:00 a.m.', monto: -850000 },
];

const LIMITES = [
  { label: 'Límite diario', usado: 2450000, tope: 5000000 },
  { label: 'Límite mensual', usado: 8600000, tope: 20000000 },
];

const TRUST_FOOTER = [
  { icon: ShieldCheck, title: 'Transferencias seguras', text: 'Tus transacciones están protegidas con encriptación de nivel bancario.' },
  { icon: Clock, title: 'Envíos al instante', text: 'A cuentas Banchocó son inmediatas, 24/7 todos los días.' },
  { icon: CheckCircle2, title: 'Sin costos ocultos', text: 'Te mostramos el costo antes de que confirmes.' },
  { icon: Headphones, title: '¿Necesitas ayuda?', text: 'Estamos disponibles 24/7 para apoyarte.', cta: true },
];

const initialForm = {
  cuentaDestino: '',
  nombreDestinatario: '',
  banco: '',
  tipoCuenta: '',
  numeroCuenta: '',
  monto: '',
  descripcion: '',
};

const ValorField = ({ value, error, disabled, onMontoChange, onQuickAmount, wide }) => (
  <div className={`field ${wide ? 'tx-field--half' : 'tx-field--third'}`}>
    <label htmlFor="monto">Valor</label>
    <div className="tx-amount-field">
      <span>$</span>
      <input
        id="monto"
        type="text"
        inputMode="numeric"
        placeholder="0"
        value={value ? Number(value).toLocaleString('es-CO') : ''}
        onChange={onMontoChange}
        disabled={disabled}
        className={error ? 'input-error' : ''}
      />
      <span className="tx-amount-field__currency">COP</span>
    </div>
    {error && <p className="error-text">{error}</p>}

    <div className="tx-quick-amounts">
      {QUICK_AMOUNTS.map((amt) => (
        <button
          type="button"
          key={amt}
          className={`tx-chip ${value === String(amt) ? 'is-selected' : ''}`}
          onClick={() => onQuickAmount(amt)}
          disabled={disabled}
        >
          {formatCOP(amt)}
        </button>
      ))}
      <button type="button" className="tx-chip" disabled={disabled}>
        Otro monto
      </button>
    </div>
  </div>
);

export default function Transferencias() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState('form'); // 'form' | 'confirm' | 'success'
  const [submitting, setSubmitting] = useState(false);
  const [tipoTransferencia, setTipoTransferencia] = useState('banchoco');
  const { pushNotification } = useNotifications();

  const [contactos, setContactos] = useState(CONTACTOS_FRECUENTES);
  const [showCreateContact, setShowCreateContact] = useState(false);
  const [nuevoContacto, setNuevoContacto] = useState({
    nombre: '',
    bancoId: '',
    tipoCuenta: '',
    numeroCuenta: '',
  });
  const [contactoErrors, setContactoErrors] = useState({});

  const bancoSeleccionado = BANCOS_COLOMBIA.find((b) => b.id === form.banco);
  const esBilletera = bancoSeleccionado?.tipo === 'billetera';

  const nuevoBancoInfo = BANCOS_CONTACTO.find((b) => b.id === nuevoContacto.bancoId);
  const esBilleteraNuevo = nuevoBancoInfo?.tipo === 'billetera';

  const handleChange = (field) => (e) => {
    let value = e.target.value;
    if (field === 'monto' || field === 'numeroCuenta') {
      value = value.replace(/[^\d]/g, '');
    }
    if (field === 'numeroCuenta') {
      value = value.slice(0, 18);
    }
    if (field === 'descripcion') {
      value = value.slice(0, 60);
    }
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleQuickAmount = (value) => {
    setForm((prev) => ({ ...prev, monto: String(value) }));
    setErrors((prev) => ({ ...prev, monto: undefined }));
  };

  const handleBanco = (e) => {
    const banco = e.target.value;
    const esBilleteraSel = BANCOS_COLOMBIA.find((b) => b.id === banco)?.tipo === 'billetera';
    setForm((prev) => ({
      ...prev,
      banco,
      tipoCuenta: esBilleteraSel ? '' : prev.tipoCuenta,
    }));
    setErrors((prev) => ({ ...prev, banco: undefined, numeroCuenta: undefined, tipoCuenta: undefined }));
  };

  const handleTipoCuenta = (tipo) => {
    setForm((prev) => ({ ...prev, tipoCuenta: tipo }));
    setErrors((prev) => ({ ...prev, tipoCuenta: undefined }));
  };

  const handleContactoClick = (contacto) => {
    Swal.fire({
      title: '¿Realizar una transferencia a este contacto?',
      text: `${contacto.nombre} · ${contacto.banco}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#0e7a46',
    }).then((result) => {
      if (!result.isConfirmed) return;
      const tipo = contacto.bancoId === 'banchoco' ? 'banchoco' : 'ach';
      setTipoTransferencia(tipo);
      setForm({
        ...initialForm,
        nombreDestinatario: contacto.nombre,
        banco: tipo === 'ach' ? contacto.bancoId : '',
        tipoCuenta:
          tipo === 'ach' && contacto.tipoCuenta !== 'billetera' ? contacto.tipoCuenta : '',
        numeroCuenta: tipo === 'ach' ? contacto.numeroCuenta : '',
        cuentaDestino: tipo === 'banchoco' ? contacto.numeroCuenta : '',
      });
      setErrors({});
      setStep('form');
    });
  };

  const handleNuevoContactoChange = (field) => (e) => {
    let value = e.target.value;
    if (field === 'numeroCuenta') {
      value = value.replace(/[^\d]/g, '').slice(0, 18);
    }
    setNuevoContacto((prev) => ({ ...prev, [field]: value }));
    setContactoErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleNuevoBanco = (e) => {
    const bancoId = e.target.value;
    const esBilletera = BANCOS_CONTACTO.find((b) => b.id === bancoId)?.tipo === 'billetera';
    setNuevoContacto((prev) => ({
      ...prev,
      bancoId,
      tipoCuenta: esBilletera ? '' : prev.tipoCuenta,
    }));
    setContactoErrors((prev) => ({ ...prev, bancoId: undefined, tipoCuenta: undefined, numeroCuenta: undefined }));
  };

  const guardarContacto = () => {
    const bancoInfo = BANCOS_CONTACTO.find((b) => b.id === nuevoContacto.bancoId);
    const esBilletera = bancoInfo?.tipo === 'billetera';
    const next = {};

    if (!nuevoContacto.nombre.trim()) {
      next.nombre = 'El nombre completo es obligatorio.';
    }
    if (!nuevoContacto.bancoId) {
      next.bancoId = 'Selecciona un banco o billetera.';
    }
    if (!esBilletera && !nuevoContacto.tipoCuenta) {
      next.tipoCuenta = 'Selecciona el tipo de cuenta.';
    }
    if (!nuevoContacto.numeroCuenta) {
      next.numeroCuenta = esBilletera
        ? 'El número de celular es obligatorio.'
        : 'El número de cuenta es obligatorio.';
    } else if (esBilletera) {
      if (!/^\d{10}$/.test(nuevoContacto.numeroCuenta)) {
        next.numeroCuenta = 'El número de celular debe tener 10 dígitos (ej. 3001234567).';
      }
    } else if (nuevoContacto.numeroCuenta.length < bancoInfo.minDigitos) {
      next.numeroCuenta = `El número de cuenta debe tener al menos ${bancoInfo.minDigitos} dígitos.`;
    }

    setContactoErrors(next);
    if (Object.keys(next).length > 0) return;

    const contacto = {
      nombre: nuevoContacto.nombre.trim(),
      bancoId: nuevoContacto.bancoId,
      banco: bancoInfo.nombre,
      tipoCuenta: esBilletera ? 'billetera' : nuevoContacto.tipoCuenta,
      numeroCuenta: nuevoContacto.numeroCuenta,
      alias: esBilletera
        ? nuevoContacto.nombre.trim().toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')
        : undefined,
      tone: TONES[contactos.length % TONES.length],
      favorito: false,
    };

    setContactos((prev) => [contacto, ...prev]);
    setNuevoContacto({ nombre: '', bancoId: '', tipoCuenta: '', numeroCuenta: '' });
    setContactoErrors({});
    setShowCreateContact(false);
  };

  const validate = () => {
    const next = {};

    if (!form.nombreDestinatario.trim()) {
      next.nombreDestinatario =
        tipoTransferencia === 'banchoco'
          ? 'El nombre del destinatario es obligatorio.'
          : 'El nombre de la persona es obligatorio.';
    }

    if (tipoTransferencia === 'banchoco') {
      if (!form.cuentaDestino.trim()) {
        next.cuentaDestino = 'Selecciona un contacto o escribe la cuenta destino.';
      }
    } else {
      if (!form.banco) {
        next.banco = 'Selecciona un banco o billetera digital.';
      } else if (esBilletera) {
        if (!/^\d{10}$/.test(form.numeroCuenta)) {
          next.numeroCuenta = 'El número de celular debe tener 10 dígitos (ej. 3001234567).';
        }
      } else {
        if (!form.tipoCuenta) {
          next.tipoCuenta = 'Selecciona el tipo de cuenta.';
        }
        if (!form.numeroCuenta) {
          next.numeroCuenta = `El número de cuenta debe tener al menos ${bancoSeleccionado.minDigitos} dígitos.`;
        } else if (form.numeroCuenta.length < bancoSeleccionado.minDigitos) {
          next.numeroCuenta = `El número de cuenta debe tener al menos ${bancoSeleccionado.minDigitos} dígitos.`;
        }
      }
    }

    const montoNum = Number(form.monto);
    if (!form.monto || montoNum <= 0) {
      next.monto = 'Ingresa un monto mayor a 0.';
    } else if (montoNum > CUENTA_ORIGEN.saldo) {
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
    // Aquí se conecta con el servicio real de transferencias (API / backend)
    await new Promise((resolve) => setTimeout(resolve, 900));
    setSubmitting(false);
    setStep('success');
    pushNotification({
      type: 'money_out',
      title: 'Enviaste dinero',
      description: `Transferencia a ${form.nombreDestinatario}${
        form.descripcion ? ` · ${form.descripcion}` : ''
      }`,
      amount: Number(form.monto) || 0,
    });
  };

  const handleNuevaTransferencia = () => {
    setForm(initialForm);
    setErrors({});
    setStep('form');
  };

  const stepIndex = step === 'form' ? 1 : step === 'confirm' ? 2 : 3;

  return (
    <div className="tx-page">
      {/* ================= SIDEBAR ================= */}
      <Sidebar />

      {/* ================= CONTENIDO ================= */}
      <div className="tx-main">
        <Topbar title="Transferencias" />

        <div className="tx-content">
          <div className="tx-grid">
            {/* ---------- NUEVA TRANSFERENCIA (horizontal) ---------- */}
            <section className="tx-form-card">
              {step !== 'success' && (
                <>
                  <div className="tx-form-head">
                    <h2 className="tx-form-card__title">Nueva transferencia</h2>
                    <div className="tx-steps">
                      {[
                        { n: 1, label: 'Datos' },
                        { n: 2, label: 'Confirmar' },
                        { n: 3, label: 'Comprobante' },
                      ].map((s, i, arr) => (
                        <div className="tx-steps__item" key={s.n}>
                          <div className="tx-steps__col">
                            <div
                              className={`tx-steps__dot ${
                                stepIndex > s.n ? 'is-done' : stepIndex === s.n ? 'is-active' : ''
                              }`}
                            >
                              {stepIndex > s.n ? <CheckCircle2 size={14} /> : s.n}
                            </div>
                            <span className={stepIndex === s.n ? 'is-active' : ''}>{s.label}</span>
                          </div>
                          {i < arr.length - 1 && (
                            <div className={`tx-steps__line ${stepIndex > s.n ? 'is-done' : ''}`} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="tx-field-label">Tipo de transferencia</div>
                  <div className="tx-tipo-grid">
                    {TIPOS_TRANSFERENCIA.map(({ key, icon: Icon, title, text }) => (
                      <button
                        type="button"
                        key={key}
                        className={`tx-tipo-card ${tipoTransferencia === key ? 'is-selected' : ''}`}
                        onClick={() => setTipoTransferencia(key)}
                        disabled={step === 'confirm'}
                      >
                        <Icon size={18} />
                        <strong>{title}</strong>
                        <span>{text}</span>
                      </button>
                    ))}
                  </div>

                  <div className="tx-field-label">Desde</div>
                  <div className="tx-origin-card">
                    <div className="tx-origin-card__icon">
                      <CreditCard size={16} />
                    </div>
                    <div className="tx-origin-card__info">
                      <strong>{CUENTA_ORIGEN.nombre}</strong>
                      <span>Saldo disponible</span>
                    </div>
                    <div className="tx-origin-card__amount">{formatCOP(CUENTA_ORIGEN.saldo)}</div>
                    <ChevronDown size={16} className="tx-origin-card__chevron" />
                  </div>

                  <form onSubmit={handleContinuar} noValidate>
                    <div className={`tx-form-fields ${tipoTransferencia === 'ach' ? 'tx-form-fields--ach' : ''}`}>
                      {tipoTransferencia === 'banchoco' ? (
                        <>
                          <div className="field tx-field--half">
                            <label htmlFor="nombreDestinatario">Para</label>
                            <div className="tx-search-field">
                              <input
                                id="nombreDestinatario"
                                type="text"
                                placeholder="Buscar contacto, cuenta o alias"
                                value={form.nombreDestinatario}
                                onChange={handleChange('nombreDestinatario')}
                                disabled={step === 'confirm'}
                                className={errors.nombreDestinatario ? 'input input-error' : 'input'}
                              />
                              <span className="tx-search-field__icon">
                                <UserPlus size={16} />
                              </span>
                            </div>
                            {errors.nombreDestinatario && (
                              <p className="error-text">{errors.nombreDestinatario}</p>
                            )}
                            {errors.cuentaDestino && <p className="error-text">{errors.cuentaDestino}</p>}
                            {form.cuentaDestino && !errors.cuentaDestino && (
                              <p className="tx-hint">{form.cuentaDestino}</p>
                            )}
                          </div>

                          <ValorField
                            value={form.monto}
                            error={errors.monto}
                            disabled={step === 'confirm'}
                            onMontoChange={handleChange('monto')}
                            onQuickAmount={handleQuickAmount}
                            wide
                          />

                          <div className="field tx-field--full">
                            <label htmlFor="descripcion">Descripción (opcional)</label>
                            <textarea
                              id="descripcion"
                              placeholder="¿Para qué es esta transferencia?"
                              value={form.descripcion}
                              onChange={handleChange('descripcion')}
                              disabled={step === 'confirm'}
                              className="textarea"
                              rows={2}
                            />
                            <p className="tx-charcount">{form.descripcion.length}/60</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="field tx-field--third">
                            <label htmlFor="nombreDestinatario">Nombre de la persona</label>
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

                          <div className="field tx-field--third">
                            <label htmlFor="banco">Banco o billetera</label>
                            <select
                              id="banco"
                              value={form.banco}
                              onChange={handleBanco}
                              disabled={step === 'confirm'}
                              className={`input tx-bank-select ${errors.banco ? 'input-error' : ''}`}
                            >
                              <option value="">Selecciona una opción</option>
                              <optgroup label="Bancos">
                                {BANCOS_COLOMBIA.filter((b) => b.tipo === 'banco').map((b) => (
                                  <option key={b.id} value={b.id}>
                                    {b.nombre}
                                  </option>
                                ))}
                              </optgroup>
                              <optgroup label="Billeteras digitales">
                                {BANCOS_COLOMBIA.filter((b) => b.tipo === 'billetera').map((b) => (
                                  <option key={b.id} value={b.id}>
                                    {b.nombre}
                                  </option>
                                ))}
                              </optgroup>
                            </select>
                            {errors.banco && <p className="error-text">{errors.banco}</p>}
                          </div>

                          {bancoSeleccionado && !esBilletera && (
                            <div className="field tx-field--third">
                              <label>Tipo de cuenta</label>
                              <div className="tx-tipo-cuenta">
                                <button
                                  type="button"
                                  className={form.tipoCuenta === 'ahorro' ? 'is-selected' : ''}
                                  onClick={() => handleTipoCuenta('ahorro')}
                                  disabled={step === 'confirm'}
                                >
                                  Ahorro
                                </button>
                                <button
                                  type="button"
                                  className={form.tipoCuenta === 'corriente' ? 'is-selected' : ''}
                                  onClick={() => handleTipoCuenta('corriente')}
                                  disabled={step === 'confirm'}
                                >
                                  Corriente
                                </button>
                              </div>
                              {errors.tipoCuenta && <p className="error-text">{errors.tipoCuenta}</p>}
                            </div>
                          )}

                          <div className="field tx-field--third">
                            <label htmlFor="numeroCuenta">
                              {esBilletera ? 'Número de celular' : 'Número de cuenta'}
                            </label>
                            <input
                              id="numeroCuenta"
                              type="text"
                              inputMode="numeric"
                              placeholder={esBilletera ? '3001234567' : 'Solo números'}
                              value={form.numeroCuenta}
                              onChange={handleChange('numeroCuenta')}
                              disabled={step === 'confirm'}
                              className={errors.numeroCuenta ? 'input input-error' : 'input'}
                            />
                            {errors.numeroCuenta && <p className="error-text">{errors.numeroCuenta}</p>}
                            {!errors.numeroCuenta && esBilletera && (
                              <p className="tx-hint">Usa el celular registrado en {bancoSeleccionado.nombre}.</p>
                            )}
                          </div>

                          <ValorField
                            value={form.monto}
                            error={errors.monto}
                            disabled={step === 'confirm'}
                            onMontoChange={handleChange('monto')}
                            onQuickAmount={handleQuickAmount}
                          />

                          <div className="field tx-field--full">
                            <label htmlFor="descripcion">Descripción (opcional)</label>
                            <textarea
                              id="descripcion"
                              placeholder="¿Para qué es esta transferencia?"
                              value={form.descripcion}
                              onChange={handleChange('descripcion')}
                              disabled={step === 'confirm'}
                              className="textarea"
                              rows={2}
                            />
                            <p className="tx-charcount">{form.descripcion.length}/60</p>
                          </div>
                        </>
                      )}
                    </div>

                    {step === 'form' && (
                      <button type="submit" className="btn-primary">
                        Continuar
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
                <div className="tx-receipt">
                  <div className="tx-receipt__wave" />
                  <div className="success-icon">
                    <CheckCircle2 size={26} />
                  </div>
                  <h2 className="success-title">Transferencia realizada</h2>
                  <p className="success-subtitle">
                    Enviaste {formatCOP(form.monto)} a {form.nombreDestinatario}.
                  </p>

                  <div className="receipt-divider" />

                  <div className="receipt-row">
                    <span>Cuenta origen</span>
                    <strong>{CUENTA_ORIGEN.nombre}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Destinatario</span>
                    <strong>{form.nombreDestinatario}</strong>
                  </div>
                  {tipoTransferencia === 'ach' ? (
                    <>
                      <div className="receipt-row">
                        <span>Banco / billetera</span>
                        <strong>{bancoSeleccionado?.nombre || '—'}</strong>
                      </div>
                      {bancoSeleccionado && !esBilletera && (
                        <div className="receipt-row">
                          <span>Tipo de cuenta</span>
                          <strong>
                            {form.tipoCuenta === 'ahorro' ? 'Ahorros' : form.tipoCuenta === 'corriente' ? 'Corriente' : '—'}
                          </strong>
                        </div>
                      )}
                      <div className="receipt-row">
                        <span>{esBilletera ? 'Celular' : 'Número de cuenta'}</span>
                        <strong>{form.numeroCuenta || '—'}</strong>
                      </div>
                    </>
                  ) : (
                    <div className="receipt-row">
                      <span>Cuenta / alias</span>
                      <strong>{form.cuentaDestino || '—'}</strong>
                    </div>
                  )}
                  <div className="receipt-row">
                    <span>Descripción</span>
                    <strong>{form.descripcion || 'Sin descripción'}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Estado</span>
                    <strong className="is-success">Completado</strong>
                  </div>

                  <button type="button" className="btn-primary" onClick={handleNuevaTransferencia}>
                    Nueva transferencia
                  </button>
                </div>
              )}
            </section>

            {/* ---------- CONTACTOS ---------- */}
            <section className="tx-panel">
              <div className="tx-panel__header">
                <h3>Contactos frecuentes</h3>
                <div className="tx-panel__actions">
                  <button
                    type="button"
                    className="tx-link-btn"
                    onClick={() => setShowCreateContact((v) => !v)}
                  >
                    <UserPlus size={14} />
                    {showCreateContact ? 'Cerrar' : 'Crear contacto'}
                  </button>
                  <button type="button" className="tx-link-btn">Ver todos</button>
                </div>
              </div>

              {showCreateContact && (
                <div className="tx-contact-create">
                  <p className="tx-contact-create__title">Nuevo contacto</p>

                  <div className="field">
                    <label htmlFor="nc-nombre">Nombre completo</label>
                    <input
                      id="nc-nombre"
                      type="text"
                      placeholder="Nombre y apellido"
                      value={nuevoContacto.nombre}
                      onChange={handleNuevoContactoChange('nombre')}
                      className={contactoErrors.nombre ? 'input input-error' : 'input'}
                    />
                    {contactoErrors.nombre && <p className="error-text">{contactoErrors.nombre}</p>}
                  </div>

                  <div className="field">
                    <label htmlFor="nc-banco">Banco o billetera</label>
                    <select
                      id="nc-banco"
                      value={nuevoContacto.bancoId}
                      onChange={handleNuevoBanco}
                      className={`input tx-bank-select ${contactoErrors.bancoId ? 'input-error' : ''}`}
                    >
                      <option value="">Selecciona una opción</option>
                      <optgroup label="Bancos">
                        {BANCOS_CONTACTO.filter((b) => b.tipo !== 'billetera').map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.nombre}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Billeteras digitales">
                        {BANCOS_CONTACTO.filter((b) => b.tipo === 'billetera').map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.nombre}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                    {contactoErrors.bancoId && <p className="error-text">{contactoErrors.bancoId}</p>}
                  </div>

                  {nuevoBancoInfo && !esBilleteraNuevo && (
                    <div className="field">
                      <label>Tipo de cuenta</label>
                      <div className="tx-tipo-cuenta">
                        <button
                          type="button"
                          className={nuevoContacto.tipoCuenta === 'ahorro' ? 'is-selected' : ''}
                          onClick={() => {
                            setNuevoContacto((prev) => ({ ...prev, tipoCuenta: 'ahorro' }));
                            setContactoErrors((prev) => ({ ...prev, tipoCuenta: undefined }));
                          }}
                        >
                          Ahorro
                        </button>
                        <button
                          type="button"
                          className={nuevoContacto.tipoCuenta === 'corriente' ? 'is-selected' : ''}
                          onClick={() => {
                            setNuevoContacto((prev) => ({ ...prev, tipoCuenta: 'corriente' }));
                            setContactoErrors((prev) => ({ ...prev, tipoCuenta: undefined }));
                          }}
                        >
                          Corriente
                        </button>
                      </div>
                      {contactoErrors.tipoCuenta && (
                        <p className="error-text">{contactoErrors.tipoCuenta}</p>
                      )}
                    </div>
                  )}

                  <div className="field">
                    <label htmlFor="nc-numero">
                      {esBilleteraNuevo ? 'Número de celular' : 'Número de cuenta'}
                    </label>
                    <input
                      id="nc-numero"
                      type="text"
                      inputMode="numeric"
                      placeholder={esBilleteraNuevo ? '3001234567' : 'Solo números'}
                      value={nuevoContacto.numeroCuenta}
                      onChange={handleNuevoContactoChange('numeroCuenta')}
                      className={contactoErrors.numeroCuenta ? 'input input-error' : 'input'}
                    />
                    {contactoErrors.numeroCuenta && (
                      <p className="error-text">{contactoErrors.numeroCuenta}</p>
                    )}
                  </div>

                  <div className="tx-contact-create__actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setShowCreateContact(false)}
                    >
                      Cancelar
                    </button>
                    <button type="button" className="btn-primary" onClick={guardarContacto}>
                      Guardar contacto
                    </button>
                  </div>
                </div>
              )}

              <div className="tx-contact-list">
                {contactos.map((c) => (
                  <button
                    type="button"
                    key={`${c.nombre}-${c.numeroCuenta}`}
                    className="tx-contact-row"
                    onClick={() => handleContactoClick(c)}
                  >
                    <span className={`tx-avatar tx-avatar--${c.tone}`}>{getInitials(c.nombre)}</span>
                    <span className="tx-contact-row__info">
                      <strong>{c.nombre}</strong>
                      <span>{c.banco}</span>
                      <span className="tx-contact-row__detalle">{contactoDetalle(c)}</span>
                    </span>
                    <Star size={16} className={c.favorito ? 'is-favorito' : ''} />
                  </button>
                ))}
              </div>
            </section>

            {/* ---------- ACTIVIDAD RECIENTE ---------- */}
            <section className="tx-panel">
              <div className="tx-panel__header">
                <h3>Actividad reciente</h3>
                <Link to="/historial" className="tx-link-btn">Ver todo</Link>
              </div>
              <div className="tx-activity-list">
                {ACTIVIDAD_RECIENTE.map((a) => (
                  <div className="tx-activity-row" key={a.titulo}>
                    <span className={`tx-icon-badge tx-icon-badge--${a.tone}`}>
                      <a.icon size={15} />
                    </span>
                    <span className="tx-activity-row__info">
                      <strong>{a.titulo}</strong>
                      <span>{a.fecha}</span>
                    </span>
                    <strong className={`tx-activity-row__amount ${a.monto > 0 ? 'is-positive' : ''}`}>
                      {a.monto > 0 ? '+ ' : '- '}
                      {formatCOP(Math.abs(a.monto))}
                    </strong>
                  </div>
                ))}
              </div>
            </section>

            {/* ---------- LÍMITES ---------- */}
            <section className="tx-panel">
              <div className="tx-panel__header">
                <h3>Límites de transferencia</h3>
                <button type="button" className="tx-link-btn">Editar</button>
              </div>
              <div className="tx-limits">
                {LIMITES.map((l) => {
                  const pct = Math.min(100, Math.round((l.usado / l.tope) * 100));
                  return (
                    <div className="tx-limit-row" key={l.label}>
                      <div className="tx-limit-row__header">
                        <span>{l.label}</span>
                        <span>
                          {formatCOP(l.usado)} / {formatCOP(l.tope)}
                        </span>
                      </div>
                      <div className="tx-limit-bar">
                        <div className="tx-limit-bar__fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="tx-limit-note">
                <Lock size={15} />
                <span>
                  Puedes aumentar tus límites desde <Link to="/ajustes">Ajustes</Link>
                </span>
                <ChevronRight size={15} />
              </div>
            </section>
          </div>

          {/* ---------- FOOTER DE CONFIANZA ---------- */}
          <section className="tx-trust-footer">
            {TRUST_FOOTER.map(({ icon: Icon, title, text, cta }) => (
              <div className="tx-trust-item" key={title}>
                <span className="tx-trust-item__icon">
                  <Icon size={18} />
                </span>
                <div>
                  <strong>{title}</strong>
                  <p>{text}</p>
                </div>
                {cta && (
                  <button type="button" className="tx-trust-item__btn">
                    Contacto
                  </button>
                )}
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
