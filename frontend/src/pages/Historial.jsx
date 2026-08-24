import { useMemo, useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import {
  ChevronDown,
  Download,
  TrendingUp,
  TrendingDown,
  PieChart,
  Receipt,
  Calendar,
  ArrowLeftRight,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  ChevronRight,
  ShieldCheck,
  Loader2,
  Search,
  Bell,
  Mail,
} from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import * as transactionService from '../services/transactions';
import '../assets/styles/historial.css';

const formatCOP = (value) => {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Math.abs(num));
};

const TIPO_OPTIONS = [
  { id: 'todos', label: 'Todos' },
  { id: 'ingreso', label: 'Ingreso' },
  { id: 'gasto', label: 'Gasto' },
];

const TIPO_ESTILO = {
  DEPOSITO: { label: 'Depósito', tone: 'green' },
  RETIRO: { label: 'Retiro', tone: 'coral' },
  TRANSFERENCIA: { label: 'Transferencia', tone: 'blue' },
};

const todayIso = () => new Date().toISOString().slice(0, 10);
const thirtyDaysAgo = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
};

const esIngresoMovimiento = (m, accountId) =>
  m.tipo === 'DEPOSITO' || (m.tipo === 'TRANSFERENCIA' && m.cuenta_destino === accountId);

export default function Historial() {
  const { profile, loading: profileLoading } = useProfile();
  const [allMovimientos, setAllMovimientos] = useState([]);
  const [totales, setTotales] = useState({ ingresos: 0, gastos: 0 });
  const [loading, setLoading] = useState(true);

  const [pendiente, setPendiente] = useState({
    tipo: 'todos',
    desde: thirtyDaysAgo(),
    hasta: todayIso(),
  });
  const [filtros, setFiltros] = useState(pendiente);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const cuenta = profile?.cuenta;
      if (!cuenta?.id_cuenta) {
        setAllMovimientos([]);
        setTotales({ ingresos: 0, gastos: 0 });
        return;
      }

      const statement = await transactionService.getAccountStatement(cuenta.id_cuenta);
      setAllMovimientos(statement.movimientos || []);

      const ingresos =
        Number(statement.total_depositos || 0) +
        Number(statement.total_transferencias_recibidas || 0);
      const gastos =
        Number(statement.total_retiros || 0) +
        Number(statement.total_transferencias_enviadas || 0);
      setTotales({ ingresos, gastos });
    } catch (err) {
      console.error('Error cargando historial:', err);
    } finally {
      setLoading(false);
    }
  }, [profile?.cuenta?.id_cuenta]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePendienteChange = (campo) => (e) => {
    setPendiente((prev) => ({ ...prev, [campo]: e.target.value }));
  };

  const handleFiltrar = () => setFiltros(pendiente);

  const movimientosFiltrados = useMemo(() => {
    const accountId = profile?.cuenta?.id_cuenta;
    return allMovimientos.filter((m) => {
      const signo = esIngresoMovimiento(m, accountId) ? 'ingreso' : 'gasto';
      if (filtros.tipo !== 'todos' && signo !== filtros.tipo) return false;
      const fechaIso = m.fecha ? String(m.fecha).slice(0, 10) : '';
      if (filtros.desde && fechaIso < filtros.desde) return false;
      if (filtros.hasta && fechaIso > filtros.hasta) return false;
      return true;
    });
  }, [filtros, allMovimientos, profile?.cuenta?.id_cuenta]);

  const grupos = useMemo(() => {
    const out = [];
    movimientosFiltrados.forEach((m) => {
      const fechaStr = m.fecha ? String(m.fecha).slice(0, 10) : '';
      const label = fechaStr
        ? new Date(`${fechaStr}T12:00:00`).toLocaleDateString('es-CO', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
        : 'Sin fecha';
      const last = out[out.length - 1];
      if (last && last.grupo === label) {
        last.items.push(m);
      } else {
        out.push({ grupo: label, items: [m] });
      }
    });
    return out;
  }, [movimientosFiltrados]);

  const resumenFiltrado = useMemo(() => {
    let ingresos = 0;
    let gastos = 0;
    const accountId = profile?.cuenta?.id_cuenta;
    movimientosFiltrados.forEach((m) => {
      if (esIngresoMovimiento(m, accountId)) ingresos += Number(m.monto);
      else gastos += Number(m.monto);
    });
    return { ingresos, gastos, total: movimientosFiltrados.length };
  }, [movimientosFiltrados, profile?.cuenta?.id_cuenta]);

  const filtrosPorDefecto =
    filtros.tipo === 'todos' &&
    filtros.desde === thirtyDaysAgo() &&
    filtros.hasta === todayIso();

  const ingresosMostrados = filtrosPorDefecto ? totales.ingresos : resumenFiltrado.ingresos;
  const gastosMostrados = filtrosPorDefecto ? totales.gastos : resumenFiltrado.gastos;

  const hayResultados = movimientosFiltrados.length > 0;
  const cuenta = profile?.cuenta;
  const cuentaLabel = cuenta
    ? `Cuenta ${cuenta.tipo || 'AHORROS'} •••• ${String(cuenta.numero_cuenta || '').slice(-4)}`
    : 'Sin cuenta';

  return (
    <div className="hs-page">
      <Sidebar />

      <div className="hs-main">
        <header className="hs-topbar">
          <div className="hs-topbar__search">
            <Search size={16} />
            <input type="text" placeholder="Buscar transacciones, contactos..." />
          </div>

          <div className="hs-topbar__actions">
            <button type="button" className="hs-icon-btn" aria-label="Notificaciones">
              <Bell size={18} />
            </button>
            <button type="button" className="hs-icon-btn" aria-label="Mensajes">
              <Mail size={18} />
            </button>
            <button type="button" className="hs-user-chip">
              <span className="hs-user-chip__avatar" />
              <span>Hola, {profile?.cliente?.nombres?.split(' ')[0] || 'Usuario'}</span>
              <ChevronDown size={15} />
            </button>
          </div>
        </header>

        <div className="hs-content">
          <div className="hs-page-header">
            <div>
              <h1 className="hs-page-title">Historial</h1>
              <p className="hs-page-subtitle">Consulta el detalle de todas tus transacciones y movimientos.</p>
            </div>
            <button type="button" className="hs-export-btn">
              <Download size={15} />
              Exportar
              <ChevronDown size={14} />
            </button>
          </div>

          <div className="hs-stats-grid">
            <div className="hs-stat-card">
              <span className="hs-stat-card__icon hs-stat-card__icon--green">
                <TrendingUp size={16} />
              </span>
              <p className="hs-stat-card__label">Total ingresos</p>
              <p className="hs-stat-card__value">{loading ? '—' : formatCOP(ingresosMostrados)}</p>
              <p className="hs-stat-card__meta">{filtrosPorDefecto ? 'Estado de cuenta' : 'Periodo filtrado'}</p>
            </div>

            <div className="hs-stat-card">
              <span className="hs-stat-card__icon hs-stat-card__icon--coral">
                <TrendingDown size={16} />
              </span>
              <p className="hs-stat-card__label">Total gastos</p>
              <p className="hs-stat-card__value">{loading ? '—' : formatCOP(gastosMostrados)}</p>
              <p className="hs-stat-card__meta">{filtrosPorDefecto ? 'Estado de cuenta' : 'Periodo filtrado'}</p>
            </div>

            <div className="hs-stat-card">
              <span className="hs-stat-card__icon hs-stat-card__icon--purple">
                <PieChart size={16} />
              </span>
              <p className="hs-stat-card__label">Saldo actual</p>
              <p className="hs-stat-card__value">{loading || !profile?.cuenta ? '—' : formatCOP(profile.cuenta.saldo)}</p>
              <p className="hs-stat-card__meta">{profile?.cuenta ? `Cuenta ${profile.cuenta.tipo || 'AHORROS'} •••• ${String(profile.cuenta.numero_cuenta || '').slice(-4)}` : '—'}</p>
            </div>

            <div className="hs-stat-card">
              <span className="hs-stat-card__icon hs-stat-card__icon--slate">
                <Receipt size={16} />
              </span>
              <p className="hs-stat-card__label">Total transacciones</p>
              <p className="hs-stat-card__value">{loading ? '—' : resumenFiltrado.total}</p>
              <p className="hs-stat-card__meta">Periodo filtrado</p>
            </div>
          </div>

          <div className="hs-filters">
            <div className="hs-filter-field hs-filter-field--account">
              <label>Cuenta</label>
              <div className="hs-account-pill">
                <div>
                  <strong>{loading ? 'Cargando…' : `Cuenta ${profile?.cuenta?.tipo || 'AHORROS'} •••• ${String(profile?.cuenta?.numero_cuenta || '').slice(-4)}`}</strong>
                  <span>Saldo disponible: {profile?.cuenta ? formatCOP(profile.cuenta.saldo) : '—'}</span>
                </div>
                <ChevronDown size={15} />
              </div>
            </div>

            <div className="hs-filter-field">
              <label htmlFor="hs-tipo">Tipo de movimiento</label>
              <select id="hs-tipo" value={pendiente.tipo} onChange={handlePendienteChange('tipo')}>
                {TIPO_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="hs-filter-field">
              <label htmlFor="hs-desde">Desde</label>
              <div className="hs-date-field">
                <input
                  id="hs-desde"
                  type="date"
                  value={pendiente.desde}
                  onChange={handlePendienteChange('desde')}
                />
                <Calendar size={15} />
              </div>
            </div>

            <div className="hs-filter-field">
              <label htmlFor="hs-hasta">Hasta</label>
              <div className="hs-date-field">
                <input
                  id="hs-hasta"
                  type="date"
                  value={pendiente.hasta}
                  onChange={handlePendienteChange('hasta')}
                />
                <Calendar size={15} />
              </div>
            </div>

            <button type="button" className="hs-filter-btn" onClick={handleFiltrar}>
              Filtrar
            </button>
          </div>

          <div className="hs-table-card">
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '24px 0', color: '#94A0B4' }}>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Cargando historial…</span>
              </div>
            )}

            {!loading && !hayResultados && (
              <div className="hs-empty-state">
                <p className="hs-empty-title">No hay movimientos con estos filtros</p>
                <p className="hs-empty-subtitle">Ajusta el rango de fechas, tipo e intenta de nuevo.</p>
              </div>
            )}

            {!loading && hayResultados && (
              <>
                <div className="hs-table-head">
                  <span>Fecha</span>
                  <span>Descripción</span>
                  <span>Tipo</span>
                  <span>Categoría</span>
                  <span className="hs-align-right">Monto</span>
                  <span />
                </div>

                {grupos.map((g) => (
                  <div key={g.grupo} className="hs-group">
                    <p className="hs-group__label">{g.grupo}</p>
                    {g.items.map((m) => {
                      const accountId = profile?.cuenta?.id_cuenta;
                      const esIngreso = esIngresoMovimiento(m, accountId);
                      const tipoEstilo = TIPO_ESTILO[m.tipo] || { label: m.tipo, tone: 'blue' };
                      const hora = m.fecha
                        ? new Date(m.fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
                        : '—';
                      return (
                        <div key={m.id_transaccion} className="hs-row">
                          <span className="hs-row__fecha">{hora}</span>

                          <span className="hs-row__desc">
                            <span className={`hs-row-icon hs-row-icon--${tipoEstilo.tone}`}>
                              <ArrowLeftRight size={15} />
                            </span>
                            <span className="hs-row-desc__text">
                              <strong>{m.descripcion || m.tipo}</strong>
                              <span>Banchocó Bank</span>
                            </span>
                          </span>

                          <span className={`hs-row__tipo ${esIngreso ? 'is-ingreso' : 'is-gasto'}`}>
                            {esIngreso ? <ArrowUp size={13} /> : <ArrowDown size={13} />}
                            {esIngreso ? 'Ingreso' : 'Gasto'}
                          </span>

                          <span className="hs-row__cat">
                            <span className={`hs-pill hs-pill--${tipoEstilo.tone}`}>{tipoEstilo.label}</span>
                          </span>

                          <span className={`hs-row__monto hs-align-right ${esIngreso ? 'is-positivo' : 'is-negativo'}`}>
                            {esIngreso ? '+ ' : '- '}
                            {formatCOP(m.monto)}
                          </span>

                          <button type="button" className="hs-row__menu" aria-label="Más opciones">
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ))}

                <div className="hs-pagination">
                  <p>
                    Mostrando {movimientosFiltrados.length} movimiento
                    {movimientosFiltrados.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </>
            )}
          </div>

          <button type="button" className="hs-tip-banner">
            <span className="hs-tip-banner__icon">
              <ShieldCheck size={18} />
            </span>
            <span className="hs-tip-banner__text">
              <strong>Consejo Banchocó</strong>
              <span>Revisa tu historial de movimientos regularmente para tener un mejor control de tus finanzas.</span>
            </span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}