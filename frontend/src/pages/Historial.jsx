import { useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import Topbar from '../components/Topbar.jsx';
import {
  ChevronDown,
  Download,
  TrendingUp,
  TrendingDown,
  PieChart,
  Receipt,
  Calendar,
  ArrowLeftRight,
  ShoppingBag,
  Wallet,
  Film,
  Zap,
  Utensils,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import '../assets/styles/topbar.css';
import '../assets/styles/historial.css';

/*
  BANCHOCÓ BANK — Historial
  --------------------------------------------------
  Vista de panel: topbar de búsqueda, tarjetas resumen del
  periodo, barra de filtros (cuenta, tipo, categoría, rango de
  fechas) y el detalle de movimientos agrupado por día, tal
  como en la referencia visual.

  Los totales de las tarjetas resumen (ingresos, gastos, saldo,
  transacciones) normalmente vendrían del backend ya
  agregados para el periodo filtrado; aquí quedan como
  constantes de ejemplo (RESUMEN_PERIODO) para que los
  reemplaces por la respuesta real de tu API.
*/

const formatCOP = (value) => {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Math.abs(num));
};

const CUENTA_ORIGEN = {
  nombre: 'Cuenta Corriente •••• 4589',
  saldo: 7250000,
};

const RESUMEN_PERIODO = {
  ingresos: { valor: 18650000, transacciones: 68, variacion: 15.7, direccion: 'up' },
  gastos: { valor: 12890000, transacciones: 92, variacion: 8.4, direccion: 'down' },
  saldoFinal: { valor: 5760000, fecha: 'Al 31 de mayo de 2026' },
  totalTransacciones: { valor: 160, rango: 'Entre 1 may. y 31 may. 2026' },
};

const CATEGORIA_STYLE = {
  transferencia: { label: 'Transferencia', icon: ArrowLeftRight, tone: 'blue' },
  compras: { label: 'Compras', icon: ShoppingBag, tone: 'orange' },
  ingreso: { label: 'Ingreso', icon: Wallet, tone: 'green' },
  entretenimiento: { label: 'Entretenimiento', icon: Film, tone: 'purple' },
  servicios: { label: 'Servicios', icon: Zap, tone: 'amber' },
  alimentacion: { label: 'Alimentación', icon: Utensils, tone: 'pink' },
};

const TIPO_OPTIONS = [
  { id: 'todos', label: 'Todos' },
  { id: 'ingreso', label: 'Ingreso' },
  { id: 'gasto', label: 'Gasto' },
];

const CATEGORIA_OPTIONS = [
  { id: 'todas', label: 'Todas' },
  ...Object.entries(CATEGORIA_STYLE).map(([id, c]) => ({ id, label: c.label })),
];

// En un proyecto real esto vendría paginado desde el backend.
const MOVIMIENTOS_DEMO = [
  { id: 'm1', grupo: 'Hoy • 31 de mayo de 2026', fecha: '2026-05-31', hora: '10:30 a.m.', titulo: 'Transferencia a María Paula', subtitulo: 'Ahorros •••• 1234', categoria: 'transferencia', signo: 'gasto', monto: 200000, saldo: 7250000 },
  { id: 'm2', grupo: 'Hoy • 31 de mayo de 2026', fecha: '2026-05-31', hora: '9:15 a.m.', titulo: 'Pago en Supermercado Éxito', subtitulo: 'Tarjeta de débito •••• 4589', categoria: 'compras', signo: 'gasto', monto: 85600, saldo: 7450000 },
  { id: 'm3', grupo: 'Hoy • 31 de mayo de 2026', fecha: '2026-05-31', hora: '8:00 a.m.', titulo: 'Nómina recibida', subtitulo: 'Empresa S.A.', categoria: 'ingreso', signo: 'ingreso', monto: 2850000, saldo: 7535600 },

  { id: 'm4', grupo: 'Ayer • 30 de mayo de 2026', fecha: '2026-05-30', hora: '8:45 p.m.', titulo: 'Pago Netflix', subtitulo: 'Suscripción mensual', categoria: 'entretenimiento', signo: 'gasto', monto: 37800, saldo: 4685600 },
  { id: 'm5', grupo: 'Ayer • 30 de mayo de 2026', fecha: '2026-05-30', hora: '6:30 p.m.', titulo: 'Transferencia a Carlos Restrepo', subtitulo: 'BBVA •••• 4567', categoria: 'transferencia', signo: 'gasto', monto: 150000, saldo: 4723400 },
  { id: 'm6', grupo: 'Ayer • 30 de mayo de 2026', fecha: '2026-05-30', hora: '2:10 p.m.', titulo: 'Pago servicio de luz', subtitulo: 'EPM', categoria: 'servicios', signo: 'gasto', monto: 78900, saldo: 4873400 },

  { id: 'm7', grupo: '29 de mayo de 2026', fecha: '2026-05-29', hora: '7:20 p.m.', titulo: 'Compra en D1', subtitulo: 'Tarjeta de débito •••• 4589', categoria: 'compras', signo: 'gasto', monto: 45600, saldo: 4952300 },
  { id: 'm8', grupo: '29 de mayo de 2026', fecha: '2026-05-29', hora: '5:00 p.m.', titulo: 'Reintegro cajero automático', subtitulo: 'Cajero Bancolombia', categoria: 'ingreso', signo: 'ingreso', monto: 60000, saldo: 4997900 },
  { id: 'm9', grupo: '29 de mayo de 2026', fecha: '2026-05-29', hora: '11:30 a.m.', titulo: 'Transferencia de Laura Sánchez', subtitulo: 'Ahorros •••• 9876', categoria: 'transferencia', signo: 'ingreso', monto: 250000, saldo: 4937900 },

  { id: 'm10', grupo: '28 de mayo de 2026', fecha: '2026-05-28', hora: '9:00 p.m.', titulo: 'Pago PlayStation Network', subtitulo: 'Suscripción', categoria: 'entretenimiento', signo: 'gasto', monto: 29900, saldo: 4687900 },
  { id: 'm11', grupo: '28 de mayo de 2026', fecha: '2026-05-28', hora: '1:15 p.m.', titulo: 'Restaurante La Casona', subtitulo: 'Tarjeta de débito •••• 4589', categoria: 'alimentacion', signo: 'gasto', monto: 62000, saldo: 4717800 },

  { id: 'm12', grupo: '27 de mayo de 2026', fecha: '2026-05-27', hora: '7:45 p.m.', titulo: 'Transferencia a Juan Andrés', subtitulo: 'Ahorros •••• 1234', categoria: 'transferencia', signo: 'gasto', monto: 120000, saldo: 4779800 },
  { id: 'm13', grupo: '27 de mayo de 2026', fecha: '2026-05-27', hora: '6:20 p.m.', titulo: 'Bonificación mensual', subtitulo: 'Banchocó Bank', categoria: 'ingreso', signo: 'ingreso', monto: 100000, saldo: 4899800 },
  { id: 'm14', grupo: '27 de mayo de 2026', fecha: '2026-05-27', hora: '10:05 a.m.', titulo: 'Pago servicio de internet', subtitulo: 'Movistar', categoria: 'servicios', signo: 'gasto', monto: 89900, saldo: 4799800 },

  { id: 'm15', grupo: '26 de mayo de 2026', fecha: '2026-05-26', hora: '9:40 a.m.', titulo: 'Pago Spotify', subtitulo: 'Suscripción mensual', categoria: 'entretenimiento', signo: 'gasto', monto: 16900, saldo: 4816700 },
];

const TOTAL_MOVIMIENTOS = 160;

export default function Historial() {
  const [pendiente, setPendiente] = useState({
    tipo: 'todos',
    categoria: 'todas',
    desde: '2026-05-01',
    hasta: '2026-05-31',
  });
  const [filtros, setFiltros] = useState(pendiente);

  const handlePendienteChange = (campo) => (e) => {
    setPendiente((prev) => ({ ...prev, [campo]: e.target.value }));
  };

  const handleFiltrar = () => setFiltros(pendiente);

  const movimientosFiltrados = useMemo(() => {
    return MOVIMIENTOS_DEMO.filter((m) => {
      if (filtros.tipo !== 'todos' && m.signo !== filtros.tipo) return false;
      if (filtros.categoria !== 'todas' && m.categoria !== filtros.categoria) return false;
      if (filtros.desde && m.fecha < filtros.desde) return false;
      if (filtros.hasta && m.fecha > filtros.hasta) return false;
      return true;
    });
  }, [filtros]);

  const grupos = useMemo(() => {
    const out = [];
    movimientosFiltrados.forEach((m) => {
      const last = out[out.length - 1];
      if (last && last.grupo === m.grupo) {
        last.items.push(m);
      } else {
        out.push({ grupo: m.grupo, items: [m] });
      }
    });
    return out;
  }, [movimientosFiltrados]);

  const hayResultados = movimientosFiltrados.length > 0;

  return (
    <div className="hs-page">
      <Sidebar />

      <div className="hs-main">
        <Topbar title="Historial" />

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

          {/* ---------- TARJETAS RESUMEN ---------- */}
          <div className="hs-stats-grid">
            <div className="hs-stat-card">
              <span className="hs-stat-card__icon hs-stat-card__icon--green">
                <TrendingUp size={16} />
              </span>
              <p className="hs-stat-card__label">Total ingresos</p>
              <p className="hs-stat-card__value">{formatCOP(RESUMEN_PERIODO.ingresos.valor)}</p>
              <p className="hs-stat-card__meta">{RESUMEN_PERIODO.ingresos.transacciones} transacciones</p>
              <p className="hs-stat-card__trend is-up">
                <ArrowUp size={12} /> {RESUMEN_PERIODO.ingresos.variacion}% vs. periodo anterior
              </p>
            </div>

            <div className="hs-stat-card">
              <span className="hs-stat-card__icon hs-stat-card__icon--coral">
                <TrendingDown size={16} />
              </span>
              <p className="hs-stat-card__label">Total gastos</p>
              <p className="hs-stat-card__value">{formatCOP(RESUMEN_PERIODO.gastos.valor)}</p>
              <p className="hs-stat-card__meta">{RESUMEN_PERIODO.gastos.transacciones} transacciones</p>
              <p className="hs-stat-card__trend is-down">
                <ArrowDown size={12} /> {RESUMEN_PERIODO.gastos.variacion}% vs. periodo anterior
              </p>
            </div>

            <div className="hs-stat-card">
              <span className="hs-stat-card__icon hs-stat-card__icon--purple">
                <PieChart size={16} />
              </span>
              <p className="hs-stat-card__label">Saldo final del periodo</p>
              <p className="hs-stat-card__value">{formatCOP(RESUMEN_PERIODO.saldoFinal.valor)}</p>
              <p className="hs-stat-card__meta">{RESUMEN_PERIODO.saldoFinal.fecha}</p>
            </div>

            <div className="hs-stat-card">
              <span className="hs-stat-card__icon hs-stat-card__icon--slate">
                <Receipt size={16} />
              </span>
              <p className="hs-stat-card__label">Total transacciones</p>
              <p className="hs-stat-card__value">{RESUMEN_PERIODO.totalTransacciones.valor}</p>
              <p className="hs-stat-card__meta">{RESUMEN_PERIODO.totalTransacciones.rango}</p>
            </div>
          </div>

          {/* ---------- FILTROS ---------- */}
          <div className="hs-filters">
            <div className="hs-filter-field hs-filter-field--account">
              <label>Cuenta</label>
              <div className="hs-account-pill">
                <div>
                  <strong>{CUENTA_ORIGEN.nombre}</strong>
                  <span>Saldo disponible: {formatCOP(CUENTA_ORIGEN.saldo)}</span>
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
              <label htmlFor="hs-categoria">Categoría</label>
              <select id="hs-categoria" value={pendiente.categoria} onChange={handlePendienteChange('categoria')}>
                {CATEGORIA_OPTIONS.map((o) => (
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

          {/* ---------- TABLA DE MOVIMIENTOS ---------- */}
          <div className="hs-table-card">
            {!hayResultados && (
              <div className="hs-empty-state">
                <p className="hs-empty-title">No hay movimientos con estos filtros</p>
                <p className="hs-empty-subtitle">Ajusta el rango de fechas, tipo o categoría e intenta de nuevo.</p>
              </div>
            )}

            {hayResultados && (
              <>
                <div className="hs-table-head">
                  <span>Fecha</span>
                  <span>Descripción</span>
                  <span>Categoría</span>
                  <span>Tipo</span>
                  <span className="hs-align-right">Monto</span>
                  <span className="hs-align-right">Saldo</span>
                  <span />
                </div>

                {grupos.map((g) => (
                  <div key={g.grupo} className="hs-group">
                    <p className="hs-group__label">{g.grupo}</p>
                    {g.items.map((m) => {
                      const cat = CATEGORIA_STYLE[m.categoria];
                      const CatIcon = cat.icon;
                      const esIngreso = m.signo === 'ingreso';
                      return (
                        <div key={m.id} className="hs-row">
                          <span className="hs-row__fecha">{m.hora}</span>

                          <span className="hs-row__desc">
                            <span className={`hs-row-icon hs-row-icon--${cat.tone}`}>
                              <CatIcon size={15} />
                            </span>
                            <span className="hs-row-desc__text">
                              <strong>{m.titulo}</strong>
                              <span>{m.subtitulo}</span>
                            </span>
                          </span>

                          <span className="hs-row__cat">
                            <span className={`hs-pill hs-pill--${cat.tone}`}>{cat.label}</span>
                          </span>

                          <span className={`hs-row__tipo ${esIngreso ? 'is-ingreso' : 'is-gasto'}`}>
                            {esIngreso ? <ArrowUp size={13} /> : <ArrowDown size={13} />}
                            {esIngreso ? 'Ingreso' : 'Gasto'}
                          </span>

                          <span className={`hs-row__monto hs-align-right ${esIngreso ? 'is-positivo' : 'is-negativo'}`}>
                            {esIngreso ? '+ ' : '- '}
                            {formatCOP(m.monto)}
                          </span>

                          <span className="hs-row__saldo hs-align-right">{formatCOP(m.saldo)}</span>

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
                    Mostrando 1 a {movimientosFiltrados.length} de {TOTAL_MOVIMIENTOS} movimientos
                  </p>
                  <div className="hs-pagination__pages">
                    <button type="button" className="hs-page-btn" aria-label="Anterior">
                      <ChevronLeft size={15} />
                    </button>
                    {[1, 2, 3].map((n) => (
                      <button
                        type="button"
                        key={n}
                        className={`hs-page-btn ${n === 1 ? 'is-active' : ''}`}
                      >
                        {n}
                      </button>
                    ))}
                    <span className="hs-page-ellipsis">…</span>
                    <button type="button" className="hs-page-btn">11</button>
                    <button type="button" className="hs-page-btn" aria-label="Siguiente">
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ---------- CONSEJO ---------- */}
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