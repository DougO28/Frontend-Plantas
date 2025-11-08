// Frontend/src/pages/DetalleRuta.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { logisticaService, type RutaEntrega } from '../api/logisticaService';
import Navbar from '../components/Navbar';
import '../styles/DetalleRuta.css';

export default function DetalleRuta() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [ruta, setRuta] = useState<RutaEntrega | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadRuta();
    }
  }, [id]);

  const loadRuta = async () => {
    try {
      setLoading(true);
      const data = await logisticaService.getRutaById(parseInt(id!));
      setRuta(data);
      setError('');
    } catch (err: any) {
      console.error('Error cargando ruta:', err);
      setError('Error al cargar ruta');
    } finally {
      setLoading(false);
    }
  };

  const handleIniciarRuta = async () => {
    if (!ruta) return;
    
    if (!window.confirm('¿Iniciar esta ruta?')) return;

    try {
      await logisticaService.iniciarRuta(ruta.id);
      alert(' Ruta iniciada');
      loadRuta();
    } catch (err: any) {
      alert(' Error al iniciar ruta: ' + (err.response?.data?.error || 'Error desconocido'));
    }
  };

  const handleFinalizarRuta = async () => {
    if (!ruta) return;
    
    if (!window.confirm('¿Finalizar esta ruta?')) return;

    try {
      await logisticaService.finalizarRuta(ruta.id);
      alert(' Ruta finalizada');
      loadRuta();
    } catch (err: any) {
      alert(' Error al finalizar ruta: ' + (err.response?.data?.error || 'Error desconocido'));
    }
  };

  const handleEliminar = async () => {
    if (!ruta) return;
    
    if (!window.confirm('⚠️ ¿Estás seguro de eliminar esta ruta?\n\nEsta acción no se puede deshacer.')) return;

    try {
      await logisticaService.deleteRuta(ruta.id);
      alert(' Ruta eliminada');
      navigate('/logistica/rutas');
    } catch (err) {
      alert(' Error al eliminar ruta');
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

  const getEtiquetaEmoji = (etiqueta: string) => {
    const emojis: Record<string, string> = {
      'terraceria': '',
      'lluvia': '',
      'fragil': '',
      'prioritario': '',
    };
    return emojis[etiqueta] || '🏷️';
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="detalle-ruta-container">
          <div className="loading">Cargando detalles de ruta...</div>
        </div>
      </>
    );
  }

  if (error || !ruta) {
    return (
      <>
        <Navbar />
        <div className="detalle-ruta-container">
          <div className="alert alert-error">{error || 'Ruta no encontrada'}</div>
          <button onClick={() => navigate('/logistica/rutas')} className="btn-secondary">
            ← Volver a Rutas
          </button>
        </div>
      </>
    );
  }

  const progreso = ruta.total_pedidos > 0 
    ? (ruta.pedidos_entregados / ruta.total_pedidos) * 100 
    : 0;

  return (
    <>
      <Navbar />
      <div className="detalle-ruta-container">
        {/* Header */}
        <div className="page-header">
          <div className="header-left">
            <button onClick={() => navigate('/logistica/rutas')} className="btn-back">
              ← Volver
            </button>
            <div>
              <div className="header-title">
                <h1>{ruta.codigo_ruta}</h1>
                <span className={`badge ${getEstadoBadgeClass(ruta.estado)}`}>
                  {getEstadoLabel(ruta.estado)}
                </span>
              </div>
              <p className="header-subtitle">{ruta.nombre_ruta}</p>
            </div>
          </div>
          <div className="header-actions">
            {ruta.estado === 'planificada' && (
              <>
                <button onClick={handleIniciarRuta} className="btn-primary">
                  ▶ Iniciar Ruta
                </button>
                <button onClick={handleEliminar} className="btn-danger">
                   Eliminar
                </button>
              </>
            )}
            {(ruta.estado === 'en_progreso' || ruta.estado === 'en_transito' || ruta.estado === 'entregando') && (
              <button onClick={handleFinalizarRuta} className="btn-success">
                 Finalizar Ruta
              </button>
            )}
          </div>
        </div>

        {/* Progreso */}
        <div className="progress-section">
          <div className="progress-info">
            <span className="progress-label">Progreso de Entregas</span>
            <span className="progress-text">
              {ruta.pedidos_entregados} de {ruta.total_pedidos} pedidos entregados ({progreso.toFixed(0)}%)
            </span>
          </div>
          <div className="progress-bar-large">
            <div 
              className="progress-fill-large"
              style={{ width: `${progreso}%` }}
            />
          </div>
        </div>

        {/* Grid de Información */}
        <div className="info-grid">
          {/* Card: Información General */}
          <div className="info-card">
            <h2 className="card-title"> Información General</h2>
            <div className="info-rows">
              <div className="info-row">
                <span className="label">Código:</span>
                <span className="value">{ruta.codigo_ruta}</span>
              </div>
              <div className="info-row">
                <span className="label">Nombre:</span>
                <span className="value">{ruta.nombre_ruta}</span>
              </div>
              <div className="info-row">
                <span className="label">Estado:</span>
                <span className={`badge ${getEstadoBadgeClass(ruta.estado)}`}>
                  {getEstadoLabel(ruta.estado)}
                </span>
              </div>
              <div className="info-row">
                <span className="label">Fecha Planificada:</span>
                <span className="value">
                  {new Date(ruta.fecha_planificada).toLocaleDateString('es-GT')}
                </span>
              </div>
              {ruta.fecha_inicio && (
                <div className="info-row">
                  <span className="label">Fecha Inicio:</span>
                  <span className="value">
                    {new Date(ruta.fecha_inicio).toLocaleString('es-GT')}
                  </span>
                </div>
              )}
              {ruta.fecha_fin && (
                <div className="info-row">
                  <span className="label">Fecha Fin:</span>
                  <span className="value">
                    {new Date(ruta.fecha_fin).toLocaleString('es-GT')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Card: Personal */}
          <div className="info-card">
            <h2 className="card-title"> Personal Asignado</h2>
            <div className="info-rows">
              <div className="info-row">
                <span className="label">Técnico de Campo:</span>
                <span className="value">{ruta.tecnico_nombre}</span>
              </div>
              {ruta.operador_nombre && (
                <div className="info-row">
                  <span className="label">Operador:</span>
                  <span className="value">{ruta.operador_nombre}</span>
                </div>
              )}
            </div>
          </div>

          {/* Card: Vehículo */}
          <div className="info-card">
            <h2 className="card-title"> Vehículo</h2>
            <div className="info-rows">
              {ruta.vehiculo_detalle ? (
                <>
                  <div className="info-row">
                    <span className="label">Placa:</span>
                    <span className="value">{ruta.vehiculo_detalle.placa}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Marca/Modelo:</span>
                    <span className="value">
                      {ruta.vehiculo_detalle.marca} {ruta.vehiculo_detalle.modelo}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="label">Capacidad:</span>
                    <span className="value">{ruta.vehiculo_detalle.capacidad_carga_kg} kg</span>
                  </div>
                </>
              ) : (
                <div className="empty-text">Sin vehículo asignado</div>
              )}
            </div>
          </div>

          {/* Card: Ubicación */}
          <div className="info-card">
            <h2 className="card-title">📍 Ubicación</h2>
            <div className="info-rows">
              <div className="info-row">
                <span className="label">Departamento:</span>
                <span className="value">{ruta.departamento_nombre}</span>
              </div>
              {ruta.punto_origen_nombre && (
                <div className="info-row">
                  <span className="label">Punto Origen:</span>
                  <span className="value">{ruta.punto_origen_nombre}</span>
                </div>
              )}
              {ruta.km_estimados && (
                <div className="info-row">
                  <span className="label">Kilómetros:</span>
                  <span className="value">{ruta.km_estimados} km</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Etiquetas */}
        {ruta.etiquetas && ruta.etiquetas.length > 0 && (
          <div className="info-card">
            <h2 className="card-title"> Etiquetas</h2>
            <div className="etiquetas-list">
              {ruta.etiquetas.map((etiqueta, index) => (
                <span key={index} className="etiqueta-tag">
                  {getEtiquetaEmoji(etiqueta)} {etiqueta}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Observaciones */}
        {ruta.observaciones && (
          <div className="info-card">
            <h2 className="card-title"> Observaciones</h2>
            <p className="observaciones-text">{ruta.observaciones}</p>
          </div>
        )}

        {/* Pedidos/Paradas */}
        <div className="info-card">
          <h2 className="card-title"> Pedidos de la Ruta ({ruta.total_pedidos})</h2>
          
          {ruta.pedidos && ruta.pedidos.length > 0 ? (
            <div className="pedidos-table-container">
              <table className="pedidos-table">
                <thead>
                  <tr>
                    <th>Orden</th>
                    <th>Código Pedido</th>
                    <th>Estado</th>
                    <th>Peso Est.</th>
                    <th>Volumen Est.</th>
                    <th>Prioridad</th>
                  </tr>
                </thead>
                <tbody>
                  {ruta.pedidos.map((pedido) => (
                    <tr key={pedido.id} className={pedido.entregado ? 'entregado' : ''}>
                      <td>
                        <span className="orden-badge">#{pedido.orden_entrega}</span>
                      </td>
                      <td>
                        <strong>{pedido.pedido_codigo}</strong>
                      </td>
                      <td>
                        {pedido.entregado ? (
                          <span className="badge badge-success"> Entregado</span>
                        ) : (
                          <span className="badge badge-pending"> Pendiente</span>
                        )}
                      </td>
                      <td>{pedido.peso_estimado_kg || '0'} kg</td>
                      <td>{pedido.volumen_estimado_m3 || '0'} m³</td>
                      <td>
                        <span className={`prioridad-badge prioridad-${pedido.prioridad || 5}`}>
                          {pedido.prioridad === 1 ? 'Alta' : 
                           pedido.prioridad <= 3 ? 'Media' : 'Normal'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-text">No hay pedidos asignados a esta ruta</div>
          )}
        </div>

        {/* Totales */}
        <div className="totales-section">
          <div className="total-card">
            <span className="total-label">Peso Total</span>
            <span className="total-value">{parseFloat(ruta.peso_total_kg).toFixed(2)} kg</span>
          </div>
          <div className="total-card">
            <span className="total-label">Volumen Total</span>
            <span className="total-value">{parseFloat(ruta.volumen_total_m3).toFixed(2)} m³</span>
          </div>
          <div className="total-card highlight">
            <span className="total-label">Total Pedidos</span>
            <span className="total-value">{ruta.total_pedidos}</span>
          </div>
        </div>
      </div>
    </>
  );
}