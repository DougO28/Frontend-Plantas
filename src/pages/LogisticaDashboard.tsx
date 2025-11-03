// Parte del modulo de logistica para las rutas y entregas.


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logisticaService, type RutaEntrega, type EstadisticasLogistica } from '../api/logisticaService';
import Navbar from '../components/Navbar';
import '../styles/LogisticaDashboard.css';

export default function LogisticaDashboard() {
  const navigate = useNavigate();
  const [estadisticas, setEstadisticas] = useState<EstadisticasLogistica | null>(null);
  const [rutasActivas, setRutasActivas] = useState<RutaEntrega[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [stats, rutas] = await Promise.all([
        logisticaService.getEstadisticas(),
        logisticaService.getRutas(),
      ]);

      setEstadisticas(stats);
      setRutasActivas(rutas.filter(r => r.estado === 'en_progreso' || r.estado === 'planificada'));
      setError('');
    } catch (err: any) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar datos de logística');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadgeClass = (estado: string) => {
    switch (estado) {
      case 'planificada': return 'badge-warning';
      case 'en_progreso': return 'badge-info';
      case 'completada': return 'badge-success';
      case 'cancelada': return 'badge-danger';
      default: return 'badge-default';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'planificada': return 'Planificada';
      case 'en_progreso': return 'En Progreso';
      case 'completada': return 'Completada';
      case 'cancelada': return 'Cancelada';
      default: return estado;
    }
  };

  if (loading && !estadisticas) {
    return (
      <>
        <Navbar />
        <div className="logistica-container">
          <div className="loading">Cargando datos de logística...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="logistica-container">
        <div className="page-header">
          <h1>Logística y Entregas</h1>
          <button 
            onClick={() => navigate('/logistica/rutas/nueva')} 
            className="btn-primary"
          >
            + Nueva Ruta
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* MÉTRICAS */}
        {estadisticas && (
          <div className="stats-grid">
            <div className="stat-card stat-warning">
              <div className="stat-icon">📦</div>
              <div className="stat-content">
                <h3>Pedidos Sin Asignar</h3>
                <p className="stat-value">{estadisticas.pedidos_sin_asignar}</p>
              </div>
            </div>

            <div className="stat-card stat-info">
              <div className="stat-icon">🚚</div>
              <div className="stat-content">
                <h3>Rutas Activas</h3>
                <p className="stat-value">{estadisticas.rutas_activas}</p>
              </div>
            </div>

            <div className="stat-card stat-success">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3>Entregas Hoy</h3>
                <p className="stat-value">{estadisticas.entregas_completadas_hoy}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🚗</div>
              <div className="stat-content">
                <h3>Vehículos Disponibles</h3>
                <p className="stat-value">
                  {estadisticas.vehiculos_disponibles}/{estadisticas.total_vehiculos}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ACCIONES RÁPIDAS */}
        <div className="quick-actions">
          <h2>Acciones Rápidas</h2>
          <div className="actions-grid">
            <button 
              className="action-card"
              onClick={() => navigate('/logistica/rutas/nueva')}
            >
              <div className="action-icon">➕</div>
              <h3>Crear Ruta</h3>
              <p>Asignar pedidos a vehículos</p>
            </button>

            <button 
              className="action-card"
              onClick={() => navigate('/logistica/rutas')}
            >
              <div className="action-icon">📋</div>
              <h3>Ver Todas las Rutas</h3>
              <p>Gestionar rutas activas</p>
            </button>

            <button 
              className="action-card"
              onClick={() => navigate('/logistica/vehiculos')}
            >
              <div className="action-icon">🚗</div>
              <h3>Vehículos</h3>
              <p>Administrar flota</p>
            </button>

            <button 
              className="action-card"
              onClick={() => navigate('/pedidos?estado=listo_entrega')}
            >
              <div className="action-icon">📦</div>
              <h3>Pedidos Listos</h3>
              <p>Ver pedidos para asignar</p>
            </button>
          </div>
        </div>

        {/* RUTAS ACTIVAS */}
        <div className="section">
          <div className="section-header">
            <h2>Rutas Activas</h2>
            <button 
              onClick={() => navigate('/logistica/rutas')}
              className="btn-secondary"
            >
              Ver Todas
            </button>
          </div>

          {rutasActivas.length === 0 ? (
            <div className="empty-state">
              <p>No hay rutas activas en este momento</p>
            </div>
          ) : (
            <div className="rutas-grid">
              {rutasActivas.map(ruta => (
                <div key={ruta.id} className="ruta-card">
                  <div className="ruta-header">
                    <h3>{ruta.codigo_ruta}</h3>
                    <span className={`badge ${getEstadoBadgeClass(ruta.estado)}`}>
                      {getEstadoLabel(ruta.estado)}
                    </span>
                  </div>

                  <div className="ruta-info">
                    <p className="ruta-name">{ruta.nombre_ruta}</p>
                    
                    <div className="ruta-details">
                      <div className="detail-item">
                        <span className="detail-label">Técnico:</span>
                        <span>{ruta.tecnico_nombre}</span>
                      </div>
                      
                      <div className="detail-item">
                        <span className="detail-label">Vehículo:</span>
                        <span>{ruta.vehiculo_detalle?.placa || 'Sin asignar'}</span>
                      </div>
                      
                      <div className="detail-item">
                        <span className="detail-label">Fecha:</span>
                        <span>{new Date(ruta.fecha_planificada).toLocaleDateString('es-GT')}</span>
                      </div>
                      
                      <div className="detail-item">
                        <span className="detail-label">Departamento:</span>
                        <span>{ruta.departamento_nombre}</span>
                      </div>
                    </div>

                    <div className="ruta-progress">
                      <span>Entregas: {ruta.pedidos_entregados}/{ruta.total_pedidos}</span>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ 
                            width: `${(ruta.pedidos_entregados / ruta.total_pedidos) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="ruta-actions">
                    <button 
                      onClick={() => navigate(`/logistica/rutas/${ruta.id}`)}
                      className="btn-view"
                    >
                      Ver Detalles
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}