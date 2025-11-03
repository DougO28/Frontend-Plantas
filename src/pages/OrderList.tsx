// src/pages/OrderList.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pedidoService } from '../api/pedidoService';
import Navbar from '../components/Navbar';
import type { Pedido } from '../types';
import '../styles/OrderList.css';

export default function OrderList() {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('Todos');

  const estados = [
  'Todos',
  'recibido',   
  'confirmado',    
  'en_preparacion',   
  'listo_entrega',      
  'en_ruta',          
  'entregado',         
  'cancelado'           
];

  useEffect(() => {
    loadPedidos();
  }, []);

  const loadPedidos = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await pedidoService.getMisPedidos();
      setPedidos(response);
    } catch (err: any) {
      console.error('Error cargando pedidos:', err);
      setError('Error al cargar los pedidos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPedidos = filterEstado === 'Todos'
    ? pedidos
    : pedidos.filter(pedido => pedido.estado === filterEstado);

  const getEstadoBadgeClass = (estado: string) => {
    const classes: { [key: string]: string } = {
      'recibido': 'badge-warning',
      'confirmado': 'badge-info',
      'en_preparacion': 'badge-processing',
      'listo_entrega': 'badge-shipped',
      'en_ruta': 'badge-transit',
      'entregado': 'badge-success',
      'cancelado': 'badge-error'
    };
    return `status-badge ${classes[estado] || 'badge-default'}`;
  };

  const getEstadoLabel = (estado: string) => {
    const labels: { [key: string]: string } = {
      'recibido': 'Recibido',
      'confirmado': 'Confirmado',
      'en_preparacion': 'En Preparación',
      'listo_entrega': 'Listo para Entrega',
      'en_ruta': 'En Ruta',
      'entregado': 'Entregado',
      'cancelado': 'Cancelado'
    };
    return labels[estado] || estado;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: string) => {
    return `Q${parseFloat(amount).toFixed(2)}`;
  };

  return (
    <div className="order-list-container">
      <Navbar />
      
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1> Mis Pedidos</h1>
            <p>Gestiona y da seguimiento a tus pedidos</p>
          </div>
          <button 
            className="btn-new-order"
            onClick={() => navigate('/pedidos/nuevo')}
          >
            + Nuevo Pedido
          </button>
        </div>

        {/* Filtros por estado */}
        <div className="filters-bar">
          <div className="filter-label">Filtrar por estado:</div>
          <div className="filter-buttons">
            {estados.map(estado => (
              <button
                key={estado}
                onClick={() => setFilterEstado(estado)}
                className={`filter-btn ${filterEstado === estado ? 'active' : ''}`}
              >
                {estado === 'Todos' ? 'Todos' : getEstadoLabel(estado)}
                {estado !== 'Todos' && (
                  <span className="filter-count">
                    {pedidos.filter(p => p.estado === estado).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando pedidos...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={loadPedidos} className="retry-btn">
              Reintentar
            </button>
          </div>
        ) : filteredPedidos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"></div>
            <p>No tienes pedidos{filterEstado !== 'Todos' && ` en estado "${getEstadoLabel(filterEstado)}"`}</p>
            {filterEstado !== 'Todos' && (
              <button onClick={() => setFilterEstado('Todos')} className="clear-filter-btn">
                Ver todos los pedidos
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="results-info">
              <p>
                Mostrando {filteredPedidos.length} de {pedidos.length} pedidos
              </p>
            </div>

            <div className="orders-list">
              {filteredPedidos.map((pedido) => (
                <div key={pedido.id} className="order-card">
                  <div className="order-header">
                    <div className="order-number">
                      <span className="label">Pedido:</span>
                      <span className="value">{pedido.codigo_seguimiento}</span>
                    </div>
                    <span className={getEstadoBadgeClass(pedido.estado)}>
                      {getEstadoLabel(pedido.estado)}
                    </span>
                  </div>

                  <div className="order-body">
                    <div className="order-info-grid">
                      <div className="info-item">
                        <span className="info-label"> Fecha de Pedido:</span>
                        <span className="info-value">
                          {formatDate(pedido.fecha_pedido)}
                        </span>
                      </div>

                      {pedido.fecha_entrega_estimada && (
                        <div className="info-item">
                          <span className="info-label">Entrega Estimada:</span>
                          <span className="info-value">
                            {formatDate(pedido.fecha_entrega_estimada)}
                          </span>
                        </div>
                      )}

                      {pedido.fecha_entrega_real && (
                        <div className="info-item">
                          <span className="info-label">Entregado el:</span>
                          <span className="info-value">
                            {formatDate(pedido.fecha_entrega_real)}
                          </span>
                        </div>
                      )}

                      <div className="info-item total">
                        <span className="info-label"> Total:</span>
                        <span className="info-value price">
                          {formatCurrency(pedido.total)}
                        </span>
                      </div>
                    </div>

                    {/* Detalles del pedido */}
                    <div className="order-details">
                      <h4>Productos ({pedido.detalles?.length || 0})</h4>
                      <div className="products-list">
                        {(pedido.detalles || []).map((detalle, index) => (
                          <div key={detalle.id || index} className="product-item">
                            <div className="product-info">
                              <span className="product-name">
                                {detalle.pilon_detalle?.nombre_comun || `Planta #${detalle.pilon}`}
                              </span>
                              <span className="product-quantity">
                                x{detalle.cantidad}
                              </span>
                            </div>
                            {detalle.subtotal && (
                              <span className="product-price">
                                {formatCurrency(detalle.subtotal)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {pedido.observaciones && (
                      <div className="order-observations">
                        <strong> Observaciones:</strong>
                        <p>{pedido.observaciones}</p>
                      </div>
                    )}

                    {pedido.calificacion && (
                      <div className="order-rating">
                        <strong> Calificación:</strong>
                        <div className="rating-stars">
                          {'⭐'.repeat(pedido.calificacion)}
                        </div>
                        {pedido.comentario_calificacion && (
                          <p className="rating-comment">{pedido.comentario_calificacion}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="order-actions">
                    <button className="btn-details">
                       Ver Detalles
                    </button>
                    {pedido.estado === 'entregado' && !pedido.calificacion && (
                      <button className="btn-rate">
                         Calificar
                      </button>
                    )}
                    {(pedido.estado === 'recibido' || pedido.estado === 'confirmado') && (
                      <button className="btn-cancel">
                         Cancelar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}