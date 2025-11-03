// src/pages/PlantList.tsx
import { useState, useEffect } from 'react';
import { catalogoService } from '../api/catalogoService';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import type { CatalogoPilon } from '../types';
import '../styles/PlantList.css';

export default function PlantList() {
  const [plantas, setPlantas] = useState<CatalogoPilon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  
  const { addItem } = useCart();

  useEffect(() => {
    loadPlantas();
  }, []);

  const loadPlantas = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await catalogoService.getPlantasDisponibles();
      setPlantas(response);
      
      // Inicializar cantidades en 1
      const initialQuantities: { [key: number]: number } = {};
      response.forEach(planta => {
        initialQuantities[planta.id] = 1;
      });
      setQuantities(initialQuantities);
    } catch (err: any) {
      console.error('Error cargando plantas:', err);
      setError('Error al cargar las plantas. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (plantaId: number, value: string) => {
    const cantidad = parseInt(value) || 1;
    setQuantities(prev => ({
      ...prev,
      [plantaId]: Math.max(1, cantidad)
    }));
  };

  const handleAddToCart = (planta: CatalogoPilon) => {
    const cantidad = quantities[planta.id] || 1;
    addItem(planta, cantidad);
    
    // Mostrar feedback visual
    alert(`✅ ${cantidad} ${planta.nombre_comun} agregado(s) al carrito`);
    
    // Resetear cantidad a 1
    setQuantities(prev => ({
      ...prev,
      [planta.id]: 1
    }));
  };

 const filteredPlantas = plantas.filter(planta => {
  const searchLower = searchTerm.toLowerCase();
  const nombreComun = planta.nombre_comun?.toLowerCase() || '';
  const nombreCientifico = planta.nombre_cientifico?.toLowerCase() || '';
  const categoria = planta.categoria?.nombre?.toLowerCase() || '';
  
  return nombreComun.includes(searchLower) ||
         nombreCientifico.includes(searchLower) ||
         categoria.includes(searchLower);
});

  return (
    <div className="plant-list-container">
      <Navbar />
      
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Catálogo de Plantas</h1>
            <p>Explora nuestro catálogo de pilones disponibles</p>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="search-bar">
          <input
            type="text"
            placeholder=" Buscar por nombre, nombre científico o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="clear-search-btn"
            >
              ✕
            </button>
          )}
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando plantas...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p> {error}</p>
            <button onClick={loadPlantas} className="retry-btn">
              Reintentar
            </button>
          </div>
        ) : filteredPlantas.length === 0 ? (
          <div className="empty-state">
            <p> No se encontraron plantas{searchTerm && ` para "${searchTerm}"`}</p>
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="clear-filter-btn">
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="results-info">
              <p>Mostrando {filteredPlantas.length} de {plantas.length} plantas</p>
            </div>
            
            <div className="plants-grid">
              {filteredPlantas.map((planta) => (
                <div key={planta.id} className="plant-card">
                  <div className="plant-image-container">
                    {planta.foto ? (
                      <img 
                        src={planta.foto} 
                        alt={planta.nombre_comun}
                        className="plant-image"
                      />
                    ) : (
                      <div className="plant-image-placeholder">
                        <img
                          src="/images/CatalogPlanta.png"
                          alt="Planta"
                          className="placeholder-icon"
                        />
                      </div>
                    )}
                    <span className="plant-category-badge">
                      {planta.categoria.nombre}
                    </span>
                  </div>
                  
                  <div className="plant-info">
                    <h3>{planta.nombre_comun}</h3>
                    {planta.nombre_cientifico && (
                      <p className="plant-scientific-name">
                        <em>{planta.nombre_cientifico}</em>
                      </p>
                    )}
                    
                    {planta.descripcion && (
                      <p className="plant-description">
                        {planta.descripcion.length > 100
                          ? `${planta.descripcion.substring(0, 100)}...`
                          : planta.descripcion}
                      </p>
                    )}

                    <div className="plant-details">
                      <div className="detail-item">
                        <span className="detail-label">Precio:</span>
                        <span className="detail-value price">
                          Q{parseFloat(planta.precio_unitario).toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="detail-item">
                        <span className="detail-label">Disponibles:</span>
                        <span className="detail-value stock">
                          {planta.cantidad_disponible} {planta.unidad_medida}
                        </span>
                      </div>

                      {planta.tiempo_crecimiento_dias && (
                        <div className="detail-item">
                          <span className="detail-label">Crecimiento:</span>
                          <span className="detail-value">
                            {planta.tiempo_crecimiento_dias} días
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Selector de cantidad */}
                    <div className="quantity-selector">
                      <label htmlFor={`qty-${planta.id}`}>Cantidad:</label>
                      <input
                        type="number"
                        id={`qty-${planta.id}`}
                        min="1"
                        max={planta.cantidad_disponible}
                        value={quantities[planta.id] || 1}
                        onChange={(e) => handleQuantityChange(planta.id, e.target.value)}
                      />
                    </div>

                    <div className="plant-actions">
                      <button 
                        className="btn-primary"
                        onClick={() => handleAddToCart(planta)}
                      >
                        Agregar al Carrito
                      </button>
                      
                    </div>
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