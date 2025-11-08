// Frontend/src/pages/CrearRuta.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { logisticaService, type Pedido, type Vehiculo, type PuntoSiembra } from '../api/logisticaService';
import axiosInstance from '../api/axiosConfig';
import Navbar from '../components/Navbar';
import '../styles/CrearRuta.css';

interface Usuario {
  id: number;
  nombre_completo: string;
  email: string;
}

interface Departamento {
  id: number;
  nombre: string;
}

const ETIQUETAS_DISPONIBLES = [
  { value: 'terraceria', label: 'Terracería', emoji: '' },
  { value: 'lluvia', label: 'Lluvia', emoji: '' },
  { value: 'fragil', label: 'Frágil', emoji: '' },
  { value: 'prioritario', label: 'Prioritario', emoji: '' },
];

export default function CrearRuta() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Estados
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Datos del formulario
  const [formData, setFormData] = useState({
    nombre_ruta: '',
    tecnico_campo: '',
    vehiculo: '',
    operador_responsable: '',
    fecha_planificada: '',
    departamento: '',
    punto_origen: '',
    km_estimados: '',
    observaciones: '',
  });
  
  const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState<string[]>([]);
  const [pedidosSeleccionados, setPedidosSeleccionados] = useState<Set<number>>(new Set());
  
  // Catálogos
  const [tecnicos, setTecnicos] = useState<Usuario[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [puntosOrigen, setPuntosOrigen] = useState<PuntoSiembra[]>([]);
  const [pedidosDisponibles, setPedidosDisponibles] = useState<Pedido[]>([]);

  useEffect(() => {
    loadCatalogos();
    
    // Si vienen pedidos pre-seleccionados desde la URL
    const pedidosParam = searchParams.get('pedidos');
    if (pedidosParam) {
      const ids = pedidosParam.split(',').map(id => parseInt(id));
      setPedidosSeleccionados(new Set(ids));
    }
  }, [searchParams]);

  const loadCatalogos = async () => {
    try {
      setLoading(true);
      
      const [
        vehiculosData,
        puntosData,
        pedidosData,
        usuariosResponse,
        deptosResponse,
      ] = await Promise.all([
        logisticaService.getVehiculosDisponibles(),
        logisticaService.getPuntosSiembra(),
        logisticaService.getPedidosDisponibles(),
        axiosInstance.get('/usuarios/'),
        axiosInstance.get('/departamentos/'),
      ]);

      setVehiculos(vehiculosData);
      setPuntosOrigen(puntosData);
      setPedidosDisponibles(pedidosData);
      
      // Filtrar solo técnicos de campo y personal de vivero
      const tecnicosData = usuariosResponse.data.filter((u: Usuario) => 
        u.email.includes('@') // Filtro simple, ajusta según tus necesidades
      );
      setTecnicos(tecnicosData);
      
      setDepartamentos(deptosResponse.data);
      
      setError('');
    } catch (err: any) {
      console.error('Error cargando catálogos:', err);
      setError('Error al cargar catálogos');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePedido = (pedidoId: number) => {
    const newSelected = new Set(pedidosSeleccionados);
    if (newSelected.has(pedidoId)) {
      newSelected.delete(pedidoId);
    } else {
      newSelected.add(pedidoId);
    }
    setPedidosSeleccionados(newSelected);
  };

  const handleToggleEtiqueta = (etiqueta: string) => {
    if (etiquetasSeleccionadas.includes(etiqueta)) {
      setEtiquetasSeleccionadas(etiquetasSeleccionadas.filter(e => e !== etiqueta));
    } else {
      setEtiquetasSeleccionadas([...etiquetasSeleccionadas, etiqueta]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.nombre_ruta) {
      alert('⚠️ El nombre de la ruta es obligatorio');
      return;
    }
    
    if (!formData.tecnico_campo) {
      alert('⚠️ Debes asignar un técnico');
      return;
    }
    
    if (!formData.fecha_planificada) {
      alert('⚠️ Debes seleccionar una fecha');
      return;
    }
    
    if (!formData.departamento) {
      alert('⚠️ Debes seleccionar un departamento');
      return;
    }
    
    if (pedidosSeleccionados.size === 0) {
      alert('⚠️ Debes seleccionar al menos un pedido');
      return;
    }

    try {
      setLoading(true);
      
      const data: any = {
        nombre_ruta: formData.nombre_ruta,
        tecnico_campo: parseInt(formData.tecnico_campo),
        fecha_planificada: formData.fecha_planificada,
        departamento: parseInt(formData.departamento),
        pedidos_ids: Array.from(pedidosSeleccionados),
        etiquetas: etiquetasSeleccionadas,
      };

      if (formData.vehiculo) data.vehiculo = parseInt(formData.vehiculo);
      if (formData.operador_responsable) data.operador_responsable = parseInt(formData.operador_responsable);
      if (formData.punto_origen) data.punto_origen = parseInt(formData.punto_origen);
      if (formData.km_estimados) data.km_estimados = parseFloat(formData.km_estimados);
      if (formData.observaciones) data.observaciones = formData.observaciones;

      const ruta = await logisticaService.createRuta(data);
      
      alert(' Ruta creada exitosamente');
      navigate(`/logistica/rutas/${ruta.id}`);
      
    } catch (err: any) {
      console.error('Error creando ruta:', err);
      const errorMsg = err.response?.data?.detail || 
                       err.response?.data?.error || 
                       'Error al crear ruta';
      alert('X ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const calcularTotales = () => {
    const pedidos = pedidosDisponibles.filter(p => pedidosSeleccionados.has(p.id));
    const totalMonto = pedidos.reduce((sum, p) => sum + parseFloat(p.total), 0);
    const totalPedidos = pedidos.length;
    return { totalMonto, totalPedidos };
  };

  const { totalMonto, totalPedidos } = calcularTotales();

  if (loading && tecnicos.length === 0) {
    return (
      <>
        <Navbar />
        <div className="crear-ruta-container">
          <div className="loading">Cargando formulario...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="crear-ruta-container">
        <div className="page-header">
          <div>
            <h1> Crear Nueva Ruta</h1>
            <p className="subtitle">Configura los detalles de la ruta y asigna pedidos</p>
          </div>
          <button onClick={() => navigate('/logistica/rutas')} className="btn-secondary">
            ← Volver a Rutas
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="crear-ruta-form">
          <div className="form-layout">
            {/* COLUMNA IZQUIERDA: Formulario */}
            <div className="form-section">
              <div className="section-card">
                <h2 className="section-title"> Información General</h2>
                
                <div className="form-group">
                  <label>Nombre de la Ruta *</label>
                  <input
                    type="text"
                    value={formData.nombre_ruta}
                    onChange={(e) => setFormData({...formData, nombre_ruta: e.target.value})}
                    placeholder="Ej: Ruta Quiché Norte - 15/01/2025"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Técnico Asignado *</label>
                    <select
                      value={formData.tecnico_campo}
                      onChange={(e) => setFormData({...formData, tecnico_campo: e.target.value})}
                      required
                    >
                      <option value="">Seleccionar técnico...</option>
                      {tecnicos.map(t => (
                        <option key={t.id} value={t.id}>{t.nombre_completo}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Operador Responsable</label>
                    <select
                      value={formData.operador_responsable}
                      onChange={(e) => setFormData({...formData, operador_responsable: e.target.value})}
                    >
                      <option value="">Sin asignar</option>
                      {tecnicos.map(t => (
                        <option key={t.id} value={t.id}>{t.nombre_completo}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Fecha Planificada *</label>
                    <input
                      type="date"
                      value={formData.fecha_planificada}
                      onChange={(e) => setFormData({...formData, fecha_planificada: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Departamento *</label>
                    <select
                      value={formData.departamento}
                      onChange={(e) => setFormData({...formData, departamento: e.target.value})}
                      required
                    >
                      <option value="">Seleccionar departamento...</option>
                      {departamentos.map(d => (
                        <option key={d.id} value={d.id}>{d.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="section-card">
                <h2 className="section-title"> Logística</h2>

                <div className="form-row">
                  <div className="form-group">
                    <label>Vehículo</label>
                    <select
                      value={formData.vehiculo}
                      onChange={(e) => setFormData({...formData, vehiculo: e.target.value})}
                    >
                      <option value="">Sin asignar</option>
                      {vehiculos.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.placa} - {v.marca} {v.modelo} ({v.capacidad_carga_kg}kg)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Punto de Origen</label>
                    <select
                      value={formData.punto_origen}
                      onChange={(e) => setFormData({...formData, punto_origen: e.target.value})}
                    >
                      <option value="">Sin especificar</option>
                      {puntosOrigen.filter(p => p.activo).map(p => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Kilómetros Estimados</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.km_estimados}
                    onChange={(e) => setFormData({...formData, km_estimados: e.target.value})}
                    placeholder="Ej: 45.5"
                  />
                </div>
              </div>

              <div className="section-card">
                <h2 className="section-title"> Etiquetas</h2>
                
                <div className="etiquetas-grid">
                  {ETIQUETAS_DISPONIBLES.map(etiq => (
                    <button
                      key={etiq.value}
                      type="button"
                      className={`etiqueta-btn ${etiquetasSeleccionadas.includes(etiq.value) ? 'active' : ''}`}
                      onClick={() => handleToggleEtiqueta(etiq.value)}
                    >
                      <span className="emoji">{etiq.emoji}</span>
                      <span>{etiq.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="section-card">
                <h2 className="section-title"> Observaciones</h2>
                
                <div className="form-group">
                  <textarea
                    value={formData.observaciones}
                    onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                    rows={4}
                    placeholder="Observaciones adicionales sobre la ruta..."
                  />
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA: Pedidos */}
            <div className="pedidos-section">
              <div className="section-card sticky">
                <h2 className="section-title"> Pedidos Disponibles</h2>
                
                <div className="pedidos-header">
                  <span className="pedidos-count">
                    {pedidosSeleccionados.size} de {pedidosDisponibles.length} seleccionados
                  </span>
                </div>

                <div className="pedidos-list">
                  {pedidosDisponibles.length === 0 ? (
                    <div className="empty-pedidos">
                      <p>No hay pedidos listos para entrega</p>
                    </div>
                  ) : (
                    pedidosDisponibles.map(pedido => (
                      <div
                        key={pedido.id}
                        className={`pedido-item ${pedidosSeleccionados.has(pedido.id) ? 'selected' : ''}`}
                        onClick={() => handleTogglePedido(pedido.id)}
                      >
                        <input
                          type="checkbox"
                          checked={pedidosSeleccionados.has(pedido.id)}
                          onChange={() => {}}
                        />
                        <div className="pedido-item-content">
                          <div className="pedido-item-header">
                            <strong>{pedido.codigo_seguimiento}</strong>
                            <span className="pedido-item-total">Q{parseFloat(pedido.total).toFixed(2)}</span>
                          </div>
                          <div className="pedido-item-info">
                            <span> {pedido.nombres_cliente} {pedido.apellidos_cliente}</span>
                            {pedido.municipio_entrega_nombre && (
                              <span>📍 {pedido.municipio_entrega_nombre}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Totales */}
                {pedidosSeleccionados.size > 0 && (
                  <div className="pedidos-totales">
                    <div className="total-row">
                      <span>Total Pedidos:</span>
                      <strong>{totalPedidos}</strong>
                    </div>
                    <div className="total-row highlight">
                      <span>Monto Total:</span>
                      <strong>Q{totalMonto.toFixed(2)}</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="form-actions">
            <button type="button" onClick={() => navigate('/logistica/rutas')} className="btn-cancel">
              Cancelar
            </button>
            <button type="submit" className="btn-submit" disabled={loading || pedidosSeleccionados.size === 0}>
              {loading ? ' Creando...' : ' Crear Ruta'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}