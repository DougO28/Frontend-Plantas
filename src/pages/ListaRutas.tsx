// Frontend/src/pages/ListaRutas.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logisticaService, type RutaEntrega } from '../api/logisticaService';
import Navbar from '../components/Navbar';
import '../styles/ListaRutas.css';

export default function ListaRutas() {
  const navigate = useNavigate();
  const [rutas, setRutas] = useState<RutaEntrega[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('');

  useEffect(() => {
    loadRutas();
  }, [filtroEstado]);

  const loadRutas = async () => {
    try {
      setLoading(true);
      const filtros = filtroEstado ? { estado: filtroEstado } : undefined;
      const data = await logisticaService.getRutas(filtros);
      setRutas(data);
      setError('');
    } catch (err: any) {
      console.error('Error cargando rutas:', err);
      setError('Error al cargar rutas');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadgeClass = (estado: string) => {
    switch (estado) {
      case 'planificada': return 'badge-warning';
      case 'asignada': return 'badge-info';
      case 'en_progreso':
      case 'en_transito':
      case 'entregando': return 'badge-primary';
      case 'completada': return 'badge-success';
      case 'cancelada': return 'badge-danger';
      default: return 'badge-default';
    }
  };

  const getEstadoLabel = (estado: string) => {
    const labels: Record<string, string> = {
      'planificada': 'Planificada',
      'asignada': 'Asignada',
      'en_progreso': 'En Progreso',
      'en_transito': 'En Tránsito',
      'entregando': 'Entregando',
      'completada': 'Completada',
      'cancelada': 'Cancelada',
    };
    return labels[estado] || estado;
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar esta ruta?')) return;
    
    try {
      await logisticaService.deleteRuta(id);
      alert(' Ruta eliminada');
      loadRutas();
    } catch (err) {
      alert(' Error al eliminar ruta');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="lista-rutas-container">
          <div className="loading">Cargando rutas...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="lista-rutas-container">
        <div className="page-header">
          <div>
            <h1>Gestión de Rutas</h1>
            <p className="subtitle">Administra todas las rutas de entrega</p>
          </div>
          <button onClick={() => navigate('/logistica/rutas/nueva')} className="btn-primary">
             Nueva Ruta
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Filtros */}
        <div className="filters-bar">
          <div className="filter-group">
            <label>Filtrar por estado:</label>
            <select 
              value={filtroEstado} 
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="filter-select"
            >
              <option value="">Todos los estados</option>
              <option value="planificada">Planificada</option>
              <option value="asignada">Asignada</option>
              <option value="en_progreso">En Progreso</option>
              <option value="en_transito">En Tránsito</option>
              <option value="entregando">Entregando</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
          
          <div className="results-count">
            {rutas.length} ruta{rutas.length !== 1 ? 's' : ''} encontrada{rutas.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Tabla de Rutas */}
        {rutas.length === 0 ? (
          <div className="empty-state">
            <p> No hay rutas registradas</p>
            <button onClick={() => navigate('/logistica/rutas/nueva')} className="btn-primary">
              Crear Primera Ruta
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="rutas-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Técnico</th>
                  <th>Vehículo</th>
                  <th>Fecha</th>
                  <th>Departamento</th>
                  <th>Estado</th>
                  <th>Progreso</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rutas.map(ruta => (
                  <tr key={ruta.id}>
                    <td>
                      <strong>{ruta.codigo_ruta}</strong>
                    </td>
                    <td>{ruta.nombre_ruta}</td>
                    <td>{ruta.tecnico_nombre}</td>
                    <td>{ruta.vehiculo_detalle?.placa || 'Sin asignar'}</td>
                    <td>{new Date(ruta.fecha_planificada).toLocaleDateString('es-GT')}</td>
                    <td>{ruta.departamento_nombre}</td>
                    <td>
                      <span className={`badge ${getEstadoBadgeClass(ruta.estado)}`}>
                        {getEstadoLabel(ruta.estado)}
                      </span>
                    </td>
                    <td>
                      <div className="progress-cell">
                        <span className="progress-text">
                          {ruta.pedidos_entregados}/{ruta.total_pedidos}
                        </span>
                        <div className="progress-bar-small">
                          <div 
                            className="progress-fill-small"
                            style={{ 
                              width: `${ruta.total_pedidos > 0 ? (ruta.pedidos_entregados / ruta.total_pedidos) * 100 : 0}%` 
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => navigate(`/logistica/rutas/${ruta.id}`)}
                          className="btn-icon btn-view"
                          title="Ver detalles"
                        >
                          
                        </button>
                        <button
                          onClick={() => handleEliminar(ruta.id)}
                          className="btn-icon btn-delete"
                          title="Eliminar"
                          disabled={ruta.estado !== 'planificada'}
                        >
                          
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}