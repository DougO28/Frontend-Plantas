// src/pages/CreateOrder.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { pedidoService } from '../api/pedidoService';
import { ubicacionService } from '../api/ubicacionService';
import Navbar from '../components/Navbar';
import type { Departamento, Municipio, CreatePedidoRequest } from '../types';
import '../styles/CreateOrder.css';

export default function CreateOrder() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCart();
//              ^^^^^^^^^^  ^^^^^^^^^^^^^^ AGREGAR ESTOS
  

  // Estados para ubicaciones
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [selectedDepartamento, setSelectedDepartamento] = useState<number | ''>('');

  // Estados del formulario
  const [formData, setFormData] = useState({
    // Información de contacto
    nombres_cliente: '',
    apellidos_cliente: '',
    nombre_contacto: '',
    telefono_contacto: '',

    // Datos de facturación
    nit_facturacion: '',
    nombre_facturacion: '',
    direccion_facturacion: '',

    // Dirección de entrega
    direccion_entrega: '',
    centro_poblado: '',
    municipio_entrega: '' as number | '',
    referencia_entrega: '',

    // Información de pago
    tipo_pago: 'transferencia' as 'transferencia' | 'contra_entrega' | 'efectivo' | 'tarjeta',
    comentario_pago: '',
    numero_deposito: '',
    fecha_deposito: '',
    monto_deposito: '',

    // Observaciones
    observaciones: '',
  });

  const [comprobantePago, setComprobantePago] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar departamentos al montar
  useEffect(() => {
    loadDepartamentos();
  }, []);

  // Cargar municipios cuando cambie el departamento
  useEffect(() => {
    if (selectedDepartamento) {
      loadMunicipios(selectedDepartamento);
    } else {
      setMunicipios([]);
      setFormData(prev => ({ ...prev, municipio_entrega: '' }));
    }
  }, [selectedDepartamento]);

  const loadDepartamentos = async () => {
    try {
      const data = await ubicacionService.getDepartamentos();
      setDepartamentos(data);
    } catch (err) {
      console.error('Error cargando departamentos:', err);
    }
  };

  const loadMunicipios = async (departamentoId: number) => {
    try {
      const data = await ubicacionService.getMunicipiosByDepartamento(departamentoId);
      setMunicipios(data);
    } catch (err) {
      console.error('Error cargando municipios:', err);
    }
  };

  const handleRemoveItem = (plantaId: number, nombrePlanta: string) => {
  if (window.confirm(`¿Eliminar "${nombrePlanta}" del carrito?`)) {
    removeItem(plantaId);
  }
};

const handleQuantityChange = (plantaId: number, newQuantity: number) => {
  if (newQuantity > 0) {
    updateQuantity(plantaId, newQuantity);
  }
};

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setComprobantePago(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      setError('El carrito está vacío. Agrega productos antes de crear el pedido.');
      return;
    }

    if (!formData.municipio_entrega) {
      setError('Selecciona un municipio de entrega.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const pedidoData: CreatePedidoRequest = {
        // Información de contacto
        nombres_cliente: formData.nombres_cliente,
        apellidos_cliente: formData.apellidos_cliente,
        nombre_contacto: formData.nombre_contacto || `${formData.nombres_cliente} ${formData.apellidos_cliente}`.trim(),
        telefono_contacto: formData.telefono_contacto,

        // Datos de facturación
        nit_facturacion: formData.nit_facturacion,
        nombre_facturacion: formData.nombre_facturacion,
        direccion_facturacion: formData.direccion_facturacion,

        // Dirección de entrega
        direccion_entrega: formData.direccion_entrega,
        centro_poblado: formData.centro_poblado,
        municipio_entrega: formData.municipio_entrega as number,
        referencia_entrega: formData.referencia_entrega,

        // Información de pago
        tipo_pago: formData.tipo_pago,
        comentario_pago: formData.comentario_pago,
        numero_deposito: formData.numero_deposito,
        fecha_deposito: formData.fecha_deposito || undefined,
        monto_deposito: formData.monto_deposito || undefined,
        comprobante_pago: comprobantePago,

        // Detalles del pedido
        detalles: items.map(item => ({
          pilon: item.planta.id,
          cantidad: item.cantidad,
          precio_unitario: item.planta.precio_unitario,
        })),

        // Observaciones
        observaciones: formData.observaciones,

        // Canal de origen
        canal_origen: 'web',
      };

      await pedidoService.createPedido(pedidoData);
      
      clearCart();
      alert('✅ Pedido creado exitosamente');
      navigate('/pedidos');
    } catch (err: any) {
      console.error('Error creando pedido:', err);
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Error al crear el pedido. Por favor, intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="create-order-container">
        <Navbar />
        <main className="main-content">
          <div className="empty-cart">
            <div className="empty-icon">🛒</div>
            <h2>El carrito está vacío</h2>
            <p>Agrega productos al carrito antes de crear un pedido</p>
            <button onClick={() => navigate('/plantas')} className="btn-primary">
              Ver Catálogo de Plantas
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="create-order-container">
      <Navbar />
      
      <main className="main-content">
        <div className="page-header">
          <h1>Crear Nuevo Pedido</h1>
          <button onClick={() => navigate('/plantas')} className="btn-back">
            ← Volver al Catálogo
          </button>
        </div>

        <div className="order-layout">
          {/* Formulario */}
          <div className="order-form-section">
            <form onSubmit={handleSubmit} className="order-form">
              {error && (
                <div className="error-message">
                  ⚠️ {error}
                </div>
              )}

              {/* Información de Contacto */}
              <section className="form-section">
                <h3> Información de Contacto</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="nombres_cliente">Nombres *</label>
                    <input
                      type="text"
                      id="nombres_cliente"
                      name="nombres_cliente"
                      value={formData.nombres_cliente}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="apellidos_cliente">Apellidos *</label>
                    <input
                      type="text"
                      id="apellidos_cliente"
                      name="apellidos_cliente"
                      value={formData.apellidos_cliente}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="telefono_contacto">Teléfono *</label>
                    <input
                      type="tel"
                      id="telefono_contacto"
                      name="telefono_contacto"
                      value={formData.telefono_contacto}
                      onChange={handleInputChange}
                      placeholder="1234-5678"
                      required
                    />
                  </div>
                </div>
              </section>

              {/* Datos de Facturación */}
              <section className="form-section">
                <h3>Datos de Facturación</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="nit_facturacion">NIT</label>
                    <input
                      type="text"
                      id="nit_facturacion"
                      name="nit_facturacion"
                      value={formData.nit_facturacion}
                      onChange={handleInputChange}
                      placeholder="12345678-9"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="nombre_facturacion">Nombre para Factura</label>
                    <input
                      type="text"
                      id="nombre_facturacion"
                      name="nombre_facturacion"
                      value={formData.nombre_facturacion}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="direccion_facturacion">Dirección de Facturación</label>
                    <input
                      type="text"
                      id="direccion_facturacion"
                      name="direccion_facturacion"
                      value={formData.direccion_facturacion}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </section>

              {/* Dirección de Entrega */}
              <section className="form-section">
                <h3>Dirección de Entrega</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="departamento">Departamento *</label>
                    <select
                      id="departamento"
                      value={selectedDepartamento}
                      onChange={(e) => setSelectedDepartamento(Number(e.target.value) || '')}
                      required
                    >
                      <option value="">Selecciona un departamento</option>
                      {departamentos.map(dep => (
                        <option key={dep.id} value={dep.id}>
                          {dep.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="municipio_entrega">Municipio *</label>
                    <select
                      id="municipio_entrega"
                      name="municipio_entrega"
                      value={formData.municipio_entrega}
                      onChange={handleInputChange}
                      required
                      disabled={!selectedDepartamento}
                    >
                      <option value="">Selecciona un municipio</option>
                      {municipios.map(mun => (
                        <option key={mun.id} value={mun.id}>
                          {mun.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="centro_poblado">Centro Poblado</label>
                    <input
                      type="text"
                      id="centro_poblado"
                      name="centro_poblado"
                      value={formData.centro_poblado}
                      onChange={handleInputChange}
                      placeholder="Aldea, caserío, barrio..."
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="direccion_entrega">Dirección Completa *</label>
                    <textarea
                      id="direccion_entrega"
                      name="direccion_entrega"
                      value={formData.direccion_entrega}
                      onChange={handleInputChange}
                      rows={2}
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="referencia_entrega">Referencias Adicionales</label>
                    <textarea
                      id="referencia_entrega"
                      name="referencia_entrega"
                      value={formData.referencia_entrega}
                      onChange={handleInputChange}
                      rows={2}
                      placeholder="Puntos de referencia para llegar..."
                    />
                  </div>
                </div>
              </section>

              {/* Información de Pago */}
              <section className="form-section">
                <h3>Información de Pago</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="tipo_pago">Tipo de Pago *</label>
                    <select
                      id="tipo_pago"
                      name="tipo_pago"
                      value={formData.tipo_pago}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="transferencia">Transferencia Bancaria</option>
                      <option value="contra_entrega">Pago Contra Entrega</option>
                      <option value="efectivo">Efectivo</option>
                      <option value="tarjeta">Tarjeta</option>
                    </select>
                  </div>

                  {formData.tipo_pago === 'transferencia' && (
                    <>
                      <div className="form-group">
                        <label htmlFor="numero_deposito">No. de Depósito</label>
                        <input
                          type="text"
                          id="numero_deposito"
                          name="numero_deposito"
                          value={formData.numero_deposito}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="fecha_deposito">Fecha de Depósito</label>
                        <input
                          type="date"
                          id="fecha_deposito"
                          name="fecha_deposito"
                          value={formData.fecha_deposito}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="monto_deposito">Monto Depositado</label>
                        <input
                          type="number"
                          id="monto_deposito"
                          name="monto_deposito"
                          value={formData.monto_deposito}
                          onChange={handleInputChange}
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>

                      <div className="form-group full-width">
                        <label htmlFor="comprobante_pago">Comprobante de Pago (Imagen)</label>
                        <input
                          type="file"
                          id="comprobante_pago"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="file-input"
                        />
                        {comprobantePago && (
                          <p className="file-name">📎 {comprobantePago.name}</p>
                        )}
                      </div>
                    </>
                  )}

                  <div className="form-group full-width">
                    <label htmlFor="comentario_pago">Comentarios sobre el Pago</label>
                    <textarea
                      id="comentario_pago"
                      name="comentario_pago"
                      value={formData.comentario_pago}
                      onChange={handleInputChange}
                      rows={2}
                    />
                  </div>
                </div>
              </section>

              {/* Observaciones */}
              <section className="form-section">
                <h3>Observaciones</h3>
                <div className="form-group">
                  <label htmlFor="observaciones">Comentarios Adicionales</label>
                  <textarea
                    id="observaciones"
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Cualquier información adicional sobre tu pedido..."
                  />
                </div>
              </section>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Creando Pedido...' : 'Confirmar Pedido'}
              </button>
            </form>
          </div>

          {/* Resumen del Pedido */}
          <div className="order-summary-section">
            <div className="order-summary">
              <h3>Resumen del Pedido</h3>

              {items.map(item => (
  <div key={item.planta.id} className="cart-item">
    <div className="item-info">
      <h4>{item.planta.nombre_comun}</h4>
      <p className="item-price">Q{parseFloat(item.planta.precio_unitario).toFixed(2)} c/u</p>
    </div>
    
    <div className="item-controls">
      <input
        type="number"
        min="1"
        max={item.planta.cantidad_disponible}
        value={item.cantidad}
        onChange={(e) => handleQuantityChange(item.planta.id, parseInt(e.target.value) || 1)}
        className="quantity-input"
      />
      
      <button
        type="button"
        onClick={() => handleRemoveItem(item.planta.id, item.planta.nombre_comun)}
        className="btn-remove"
        title="Eliminar del carrito"
      >
        🗑️
      </button>
    </div>
    
    <div className="item-subtotal">
      Q{(parseFloat(item.planta.precio_unitario) * item.cantidad).toFixed(2)}
    </div>
  </div>
))}
              
              

              <div className="summary-total">
                <span>Total:</span>
                <span className="total-price">Q{getTotalPrice().toFixed(2)}</span>
              </div>

              <div className="summary-info">
                <p>✓ {items.length} producto(s)</p>
                <p>✓ Total de plantas: {items.reduce((sum, item) => sum + item.cantidad, 0)}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}