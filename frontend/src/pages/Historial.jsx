import { useMemo, useState } from 'react';
import MareaNavbar from '../components/Navbar.jsx';
import '../assets/styles/historial.css';

const formatCOP = (value) => {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Math.abs(num));
};

const formatFecha = (isoDate) => {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }).format(
    date
  );
};

const tipoLabel = {
  transferencia: 'Transferencia',
  deposito: 'Depósito',
  retiro: 'Retiro',
};

// En un proyecto real esto vendría del backend
const movimientosDemo = [
  { id: 'm1', fecha: '2026-08-01', tipo: 'deposito', valor: 500000, estado: 'completado' },
  { id: 'm2', fecha: '2026-07-29', tipo: 'transferencia', valor: -120000, estado: 'completado' },
  { id: 'm3', fecha: '2026-07-27', tipo: 'retiro', valor: -80000, estado: 'completado' },
  { id: 'm4', fecha: '2026-07-24', tipo: 'transferencia', valor: -45000, estado: 'pendiente' },
  { id: 'm5', fecha: '2026-07-20', tipo: 'deposito', valor: 300000, estado: 'completado' },
];

const filtros = [
  { id: 'todos', label: 'Todos' },
  { id: 'transferencia', label: 'Transferencias' },
  { id: 'deposito', label: 'Depósitos' },
  { id: 'retiro', label: 'Retiros' },
];

export default function Historial() {
  const [filtroTipo, setFiltroTipo] = useState('todos');

  const movimientosFiltrados = useMemo(() => {
    if (filtroTipo === 'todos') return movimientosDemo;
    return movimientosDemo.filter((m) => m.tipo === filtroTipo);
  }, [filtroTipo]);

  const hayMovimientos = movimientosDemo.length > 0;
  const hayResultadosFiltro = movimientosFiltrados.length > 0;

  return (
    <div className="history-page">
      <MareaNavbar />
      <div className="history-card">
        <div className="history-header">
          <div>
            <h1 className="history-title">Historial de movimientos</h1>
            <p className="history-subtitle">Consulta y filtra tus transacciones.</p>
          </div>

          <select
            className="filter-select"
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            aria-label="Filtrar por tipo de movimiento"
          >
            {filtros.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        {!hayMovimientos && (
          <div className="empty-state">
            <p className="empty-title">Aún no tienes movimientos</p>
            <p className="empty-subtitle">Tus transferencias, depósitos y retiros aparecerán aquí.</p>
          </div>
        )}

        {hayMovimientos && !hayResultadosFiltro && (
          <div className="empty-state">
            <p className="empty-title">No hay movimientos con este filtro</p>
            <p className="empty-subtitle">Prueba con otro tipo de movimiento.</p>
          </div>
        )}

        {hayResultadosFiltro && (
          <table className="history-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {movimientosFiltrados.map((m) => (
                <tr key={m.id}>
                  <td className="cell-fecha" data-label="Fecha">
                    {formatFecha(m.fecha)}
                  </td>
                  <td data-label="Tipo">{tipoLabel[m.tipo]}</td>
                  <td
                    className={m.valor >= 0 ? 'cell-valor positivo' : 'cell-valor negativo'}
                    data-label="Valor"
                  >
                    {m.valor >= 0 ? '+' : '-'}
                    {formatCOP(m.valor)}
                  </td>
                  <td data-label="Estado">
                    <span className={`status-pill ${m.estado}`}>
                      {m.estado === 'completado' ? 'Completado' : 'Pendiente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
