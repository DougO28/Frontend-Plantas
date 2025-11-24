// PedidosListos
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logisticaService, type Pedido } from '../api/logisticaService';
import Navbar from '../components/Navbar';
import '../styles/PedidosListos.css';

export default function PedidosListos() {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPedidos, setSelectedPedidos] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadPedidos();
  }, []);

  const loadPedidos = async () => {
    try {
      setLoading(true);
      const data = await logisticaService.getPedidosDisponibles();
      setPedidos(data);
      setError('');
    } catch (err: any) {
      console.error('Error cargando pedidos:', err);
      setError('Error al cargar pedidos listos');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSelection = (id: number) => {
    const newSelected = new Set(selectedPedidos);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedPedidos(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedPedidos.size === pedidos.length) {
      setSelectedPedidos(new Set());
    } else {
      setSelectedPedidos(new Set(pedidos.map(p => p.id)));
    }
  };

  const handleCrearRuta = () => {
    if (selectedPedidos.size === 0) {
      alert('⚠️ Selecciona al menos un pedido');
      return;
    }
    // Navegar a crear ruta con pedidos seleccionados
    const pedidosIds = Array.from(selectedPedidos).join(',');
    navigate(`/logistica/rutas/nueva?pedidos=${pedidosIds}`);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="pedidos-listos-container">
          <div className="loading">Cargando pedidos...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="pedidos-listos-container">
        <div className="page-header">
          <div>
            <h1>Pedidos Listos para Entrega</h1>
            <p className="subtitle">Pedidos en estado "Listo para Entrega" sin asignar a ruta</p>
          </div>
          <button 
            onClick={handleCrearRuta}
            className="btn-primary"
            disabled={selectedPedidos.size === 0}
          >
             Crear Ruta con Seleccionados ({selectedPedidos.size})
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Contador y Acciones */}
        <div className="actions-bar">
          <div className="selection-info">
            <button onClick={handleSelectAll} className="btn-select-all">
              {selectedPedidos.size === pedidos.length ? '☑️' : '☐'} Seleccionar todos
            </button>
            <span className="count-text">
              {selectedPedidos.size > 0 ? (
                <>
                  <strong>{selectedPedidos.size}</strong> de <strong>{pedidos.length}</strong> seleccionados
                </>
              ) : (
                <><strong>{pedidos.length}</strong> pedidos disponibles</>
              )}
            </span>
          </div>
        </div>

        {/* Lista de Pedidos */}
        {pedidos.length === 0 ? (
          <div className="empty-state">
            <p> No hay pedidos listos para entrega</p>
            <p className="empty-subtitle">Todos los pedidos están asignados a rutas o en otros estados</p>
          </div>
        ) : (
          <div className="pedidos-grid">
            {pedidos.map(pedido => (
              <div 
                key={pedido.id} 
                className={`pedido-card ${selectedPedidos.has(pedido.id) ? 'selected' : ''}`}
                onClick={() => handleToggleSelection(pedido.id)}
              >
                <div className="pedido-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedPedidos.has(pedido.id)}
                    onChange={() => {}}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                <div className="pedido-content">
                  <div className="pedido-header">
                    <h3>{pedido.codigo_seguimiento}</h3>
                    <span className="badge badge-ready">Listo</span>
                  </div>

                  <div className="pedido-info">
                    <div className="info-row">
                      <span className="label"> Cliente:</span>
                      <span className="value">
                        {pedido.nombres_cliente} {pedido.apellidos_cliente}
                      </span>
                    </div>

                    {pedido.municipio_entrega_nombre && (
                      <div className="info-row">
                        <span className="label">📍 Municipio:</span>
                        <span className="value">{pedido.municipio_entrega_nombre}</span>
                      </div>
                    )}

                    <div className="info-row">
                      <span className="label"> Fecha pedido:</span>
                      <span className="value">
                        {new Date(pedido.fecha_pedido).toLocaleDateString('es-GT')}
                      </span>
                    </div>

                    <div className="info-row highlight">
                      <span className="label"> Total:</span>
                      <span className="value total">Q{parseFloat(pedido.total).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Botón flotante para crear ruta */}
        {selectedPedidos.size > 0 && (
          <button onClick={handleCrearRuta} className="btn-floating">
             Crear Ruta ({selectedPedidos.size})
          </button>
        )}
      </div>
    </>
  );
}