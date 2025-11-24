// OrderList.tsx
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
  
  //  Estados para modales
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [showCalificarModal, setShowCalificarModal] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);
  
  //  Estados para calificación
  const [calificacion, setCalificacion] = useState(0);
  const [comentarioCalificacion, setComentarioCalificacion] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

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

  //  Abrir modal de detalles
  const handleVerDetalles = (pedido: Pedido) => {
    setPedidoSeleccionado(pedido);
    setShowDetalleModal(true);
  };

  // Abrir modal de calificar
  const handleCalificar = (pedido: Pedido) => {
    setPedidoSeleccionado(pedido);
    setCalificacion(0);
    setComentarioCalificacion('');
    setShowCalificarModal(true);
  };

  // NUEVO: Enviar calificación
  const handleEnviarCalificacion = async () => {
    if (!pedidoSeleccionado || calificacion === 0) {
      alert('⚠️ Por favor selecciona una calificación');
      return;
    }

    try {
      await pedidoService.calificarPedido(
        pedidoSeleccionado.id,
        calificacion,
        comentarioCalificacion
      );
      
      alert(' Calificación enviada. ¡Gracias por tu opinión!');
      setShowCalificarModal(false);
      loadPedidos(); // Recargar para mostrar la calificación
    } catch (err: any) {
      console.error('Error al calificar:', err);
      alert(' Error al enviar calificación');
    }
  };

  // Cancelar pedido
  const handleCancelar = async (pedido: Pedido) => {
    if (!window.confirm(`¿Estás seguro de cancelar el pedido ${pedido.codigo_seguimiento}?`)) {
      return;
    }

    try {
      await pedidoService.cambiarEstado(pedido.id, 'cancelado');
      alert(' Pedido cancelado exitosamente');
      loadPedidos();
    } catch (err: any) {
      console.error('Error al cancelar:', err);
      alert(' Error al cancelar el pedido');
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
            <h1>Mis Pedidos</h1>
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
            <div className="empty-icon">📭</div>
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
                        <span className="info-label">Fecha de Pedido:</span>
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
                        <span className="info-label">Total:</span>
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
                        <strong>Observaciones:</strong>
                        <p>{pedido.observaciones}</p>
                      </div>
                    )}

                    {pedido.calificacion && (
                      <div className="order-rating">
                        <strong>⭐ Calificación:</strong>
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
                    <button 
                      className="btn-details"
                      onClick={() => handleVerDetalles(pedido)}
                    >
                      Ver Detalles
                    </button>
                    {pedido.estado === 'entregado' && !pedido.calificacion && (
                      <button 
                        className="btn-rate"
                        onClick={() => handleCalificar(pedido)}
                      >
                        ⭐ Calificar
                      </button>
                    )}
                    {(pedido.estado === 'recibido' || pedido.estado === 'confirmado') && (
                      <button 
                        className="btn-cancel"
                        onClick={() => handleCancelar(pedido)}
                      >
                        ❌ Cancelar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* MODAL VER DETALLES */}
        {showDetalleModal && pedidoSeleccionado && (
          <div className="modal-overlay" onClick={() => setShowDetalleModal(false)}>
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Detalles del Pedido</h2>
                <button onClick={() => setShowDetalleModal(false)} className="btn-close">✕</button>
              </div>
              
              <div className="modal-body">
                <div className="detail-section">
                  <h3>Información General</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <strong>Código:</strong>
                      <span>{pedidoSeleccionado.codigo_seguimiento}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Estado:</strong>
                      <span className={getEstadoBadgeClass(pedidoSeleccionado.estado)}>
                        {getEstadoLabel(pedidoSeleccionado.estado)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <strong>Fecha Pedido:</strong>
                      <span>{formatDate(pedidoSeleccionado.fecha_pedido)}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Total:</strong>
                      <span className="price">{formatCurrency(pedidoSeleccionado.total)}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Productos</h3>
                  <table className="detail-table">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio Unit.</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(pedidoSeleccionado.detalles || []).map((detalle, index) => (
                        <tr key={index}>
                          <td>{detalle.pilon_detalle?.nombre_comun || `Planta #${detalle.pilon}`}</td>
                          <td>{detalle.cantidad}</td>
                          <td>{formatCurrency(detalle.precio_unitario || '0')}</td>
                          <td>{formatCurrency(detalle.subtotal || '0')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {pedidoSeleccionado.observaciones && (
                  <div className="detail-section">
                    <h3>Observaciones</h3>
                    <p>{pedidoSeleccionado.observaciones}</p>
                  </div>
                )}
              </div>
              
              <div className="modal-footer">
                <button onClick={() => setShowDetalleModal(false)} className="btn-secondary">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL CALIFICAR */}
        {showCalificarModal && pedidoSeleccionado && (
          <div className="modal-overlay" onClick={() => setShowCalificarModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Calificar Pedido</h2>
                <button onClick={() => setShowCalificarModal(false)} className="btn-close">✕</button>
              </div>
              
              <div className="modal-body">
                <p className="modal-subtitle">
                  Pedido: <strong>{pedidoSeleccionado.codigo_seguimiento}</strong>
                </p>
                
                <div className="rating-section">
                  <label>¿Cómo calificarías tu experiencia?</label>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`star-btn ${star <= (hoverRating || calificacion) ? 'active' : ''}`}
                        onClick={() => setCalificacion(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                  <p className="rating-text">
                    {calificacion === 0 && 'Selecciona una calificación'}
                    {calificacion === 1 && 'Muy malo'}
                    {calificacion === 2 && 'Malo'}
                    {calificacion === 3 && 'Regular'}
                    {calificacion === 4 && 'Bueno'}
                    {calificacion === 5 && '¡Excelente!'}
                  </p>
                </div>

                <div className="form-group">
                  <label>Comentario (opcional)</label>
                  <textarea
                    value={comentarioCalificacion}
                    onChange={(e) => setComentarioCalificacion(e.target.value)}
                    placeholder="Cuéntanos sobre tu experiencia..."
                    rows={4}
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button onClick={() => setShowCalificarModal(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button 
                  onClick={handleEnviarCalificacion} 
                  className="btn-primary"
                  disabled={calificacion === 0}
                >
                  Enviar Calificación
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}