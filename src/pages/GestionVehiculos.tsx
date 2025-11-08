// Frontend/src/pages/GestionVehiculos.tsx
import { useState, useEffect } from 'react';
import { logisticaService, type Vehiculo, type Transportista } from '../api/logisticaService';
import Navbar from '../components/Navbar';
import '../styles/GestionVehiculos.css';

export default function GestionVehiculos() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [transportistas, setTransportistas] = useState<Transportista[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVehiculo, setEditingVehiculo] = useState<Vehiculo | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    placa: '',
    tipo: 'camion' as 'camion' | 'pickup' | 'panel',
    marca: '',
    modelo: '',
    año: '',
    capacidad_carga_kg: '',
    capacidad_volumen_m3: '',
    largo_m: '',
    ancho_m: '',
    alto_m: '',
    transportista: '',
    observaciones: '',
    activo: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [vehiculosData, transportistasData] = await Promise.all([
        logisticaService.getVehiculos(),
        logisticaService.getTransportistas(),
      ]);
      setVehiculos(vehiculosData);
      setTransportistas(transportistasData);
      setError('');
    } catch (err: any) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (vehiculo?: Vehiculo) => {
    if (vehiculo) {
      setEditingVehiculo(vehiculo);
      setFormData({
        placa: vehiculo.placa,
        tipo: vehiculo.tipo,
        marca: vehiculo.marca,
        modelo: vehiculo.modelo,
        año: vehiculo.año?.toString() || '',
        capacidad_carga_kg: vehiculo.capacidad_carga_kg,
        capacidad_volumen_m3: vehiculo.capacidad_volumen_m3 || '',
        largo_m: vehiculo.largo_m || '',
        ancho_m: vehiculo.ancho_m || '',
        alto_m: vehiculo.alto_m || '',
        transportista: vehiculo.transportista?.toString() || '',
        observaciones: vehiculo.observaciones,
        activo: vehiculo.activo,
      });
    } else {
      setEditingVehiculo(null);
      setFormData({
        placa: '',
        tipo: 'camion',
        marca: '',
        modelo: '',
        año: '',
        capacidad_carga_kg: '',
        capacidad_volumen_m3: '',
        largo_m: '',
        ancho_m: '',
        alto_m: '',
        transportista: '',
        observaciones: '',
        activo: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingVehiculo(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data: any = {
        placa: formData.placa,
        tipo: formData.tipo,
        marca: formData.marca,
        modelo: formData.modelo,
        capacidad_carga_kg: parseFloat(formData.capacidad_carga_kg),
        activo: formData.activo,
      };

      if (formData.año) data.año = parseInt(formData.año);
      if (formData.capacidad_volumen_m3) data.capacidad_volumen_m3 = parseFloat(formData.capacidad_volumen_m3);
      if (formData.largo_m) data.largo_m = parseFloat(formData.largo_m);
      if (formData.ancho_m) data.ancho_m = parseFloat(formData.ancho_m);
      if (formData.alto_m) data.alto_m = parseFloat(formData.alto_m);
      if (formData.transportista) data.transportista = parseInt(formData.transportista);
      if (formData.observaciones) data.observaciones = formData.observaciones;

      if (editingVehiculo) {
        await logisticaService.updateVehiculo(editingVehiculo.id, data);
        alert(' Vehículo actualizado');
      } else {
        await logisticaService.createVehiculo(data);
        alert(' Vehículo creado');
      }
      
      handleCloseModal();
      loadData();
    } catch (err: any) {
      console.error('Error guardando vehículo:', err);
      alert('❌ Error al guardar vehículo: ' + (err.response?.data?.detail || 'Error desconocido'));
    }
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este vehículo?')) return;
    
    try {
      await logisticaService.deleteVehiculo(id);
      alert(' Vehículo eliminado');
      loadData();
    } catch (err) {
      alert(' Error al eliminar vehículo');
    }
  };

  const getTransportistaNombre = (id: number | null) => {
    if (!id) return 'Sin asignar';
    const trans = transportistas.find(t => t.id === id);
    return trans?.nombre || 'Desconocido';
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="gestion-vehiculos-container">
          <div className="loading">Cargando vehículos...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="gestion-vehiculos-container">
        <div className="page-header">
          <div>
            <h1>Gestión de Vehículos</h1>
            <p className="subtitle">Administra la flota de vehículos</p>
          </div>
          <button onClick={() => handleOpenModal()} className="btn-primary">
             Nuevo Vehículo
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Grid de Vehículos */}
        {vehiculos.length === 0 ? (
          <div className="empty-state">
            <p> No hay vehículos registrados</p>
            <button onClick={() => handleOpenModal()} className="btn-primary">
              Agregar Primer Vehículo
            </button>
          </div>
        ) : (
          <div className="vehiculos-grid">
            {vehiculos.map(vehiculo => (
              <div key={vehiculo.id} className={`vehiculo-card ${!vehiculo.activo ? 'inactive' : ''}`}>
                <div className="vehiculo-header">
                  <div className="vehiculo-icon">
                    {vehiculo.tipo === 'camion' && 'C'}
                    {vehiculo.tipo === 'pickup' && 'PK'}
                    {vehiculo.tipo === 'panel' && 'PL'}
                  </div>
                  <div>
                    <h3>{vehiculo.placa}</h3>
                    <span className="vehiculo-tipo">{vehiculo.tipo.toUpperCase()}</span>
                  </div>
                  {!vehiculo.activo && (
                    <span className="badge badge-inactive">Inactivo</span>
                  )}
                </div>

                <div className="vehiculo-info">
                  <div className="info-row">
                    <span className="label">Marca/Modelo:</span>
                    <span className="value">{vehiculo.marca} {vehiculo.modelo}</span>
                  </div>
                  
                  {vehiculo.año && (
                    <div className="info-row">
                      <span className="label">Año:</span>
                      <span className="value">{vehiculo.año}</span>
                    </div>
                  )}

                  <div className="info-row">
                    <span className="label">Capacidad:</span>
                    <span className="value">{vehiculo.capacidad_carga_kg} kg</span>
                  </div>

                  {vehiculo.capacidad_volumen_m3 && (
                    <div className="info-row">
                      <span className="label">Volumen:</span>
                      <span className="value">{vehiculo.capacidad_volumen_m3} m³</span>
                    </div>
                  )}

                  {vehiculo.dimensiones_str && vehiculo.dimensiones_str !== 'No especificado' && (
                    <div className="info-row">
                      <span className="label">Dimensiones:</span>
                      <span className="value">{vehiculo.dimensiones_str}</span>
                    </div>
                  )}

                  <div className="info-row">
                    <span className="label">Transportista:</span>
                    <span className="value">{getTransportistaNombre(vehiculo.transportista)}</span>
                  </div>

                  {vehiculo.observaciones && (
                    <div className="observaciones">
                      <span className="label">Observaciones:</span>
                      <p>{vehiculo.observaciones}</p>
                    </div>
                  )}
                </div>

                <div className="vehiculo-actions">
                  <button
                    onClick={() => handleOpenModal(vehiculo)}
                    className="btn-secondary"
                  >
                     Editar
                  </button>
                  <button
                    onClick={() => handleEliminar(vehiculo.id)}
                    className="btn-danger"
                  >
                     Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingVehiculo ? 'Editar Vehículo' : 'Nuevo Vehículo'}</h2>
                <button onClick={handleCloseModal} className="btn-close">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Placa *</label>
                    <input
                      type="text"
                      value={formData.placa}
                      onChange={(e) => setFormData({...formData, placa: e.target.value.toUpperCase()})}
                      required
                      maxLength={10}
                      placeholder="P-001ABC"
                    />
                  </div>

                  <div className="form-group">
                    <label>Tipo *</label>
                    <select
                      value={formData.tipo}
                      onChange={(e) => setFormData({...formData, tipo: e.target.value as any})}
                      required
                    >
                      <option value="camion">Camión</option>
                      <option value="pickup">Pickup</option>
                      <option value="panel">Panel</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Marca *</label>
                    <input
                      type="text"
                      value={formData.marca}
                      onChange={(e) => setFormData({...formData, marca: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Modelo *</label>
                    <input
                      type="text"
                      value={formData.modelo}
                      onChange={(e) => setFormData({...formData, modelo: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Año</label>
                    <input
                      type="number"
                      value={formData.año}
                      onChange={(e) => setFormData({...formData, año: e.target.value})}
                      min="1990"
                      max="2030"
                    />
                  </div>

                  <div className="form-group">
                    <label>Capacidad Carga (kg) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.capacidad_carga_kg}
                      onChange={(e) => setFormData({...formData, capacidad_carga_kg: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Volumen (m³)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.capacidad_volumen_m3}
                      onChange={(e) => setFormData({...formData, capacidad_volumen_m3: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label>Largo (m)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.largo_m}
                      onChange={(e) => setFormData({...formData, largo_m: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label>Ancho (m)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.ancho_m}
                      onChange={(e) => setFormData({...formData, ancho_m: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label>Alto (m)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.alto_m}
                      onChange={(e) => setFormData({...formData, alto_m: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label>Transportista</label>
                    <select
                      value={formData.transportista}
                      onChange={(e) => setFormData({...formData, transportista: e.target.value})}
                    >
                      <option value="">Sin asignar</option>
                      {transportistas.filter(t => t.activo).map(t => (
                        <option key={t.id} value={t.id}>{t.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group form-group-full">
                    <label>Observaciones</label>
                    <textarea
                      value={formData.observaciones}
                      onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                      rows={3}
                      placeholder="Ej: No entra en terracería pesada"
                    />
                  </div>

                  <div className="form-group form-group-full">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.activo}
                        onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                      />
                      Vehículo activo
                    </label>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={handleCloseModal} className="btn-secondary">
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingVehiculo ? 'Actualizar' : 'Crear'} Vehículo
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}