// pagina de metricas y las estadisticas 
import { useState, useEffect } from 'react';
import { type DashboardEstadisticas } from '../api/dashboardService';
import axiosInstance from '../api/axiosConfig';
import Navbar from '../components/Navbar';
import '../styles/Dashboard.css';

// Tipo para el filtro
type FiltroFecha = 'ultimos_7_dias' | 'ultimos_30_dias' | 'este_mes' | 'mes_pasado' | 'personalizado';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardEstadisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados para filtros
  const [filtroActual, setFiltroActual] = useState<FiltroFecha>('ultimos_7_dias');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const loadStats = async (filtro?: FiltroFecha, inicio?: string, fin?: string) => {
    try {
      setLoading(true);
      
      // Construir URL con parámetros de filtro
      const params = new URLSearchParams();
      
      const filtroParam = filtro || filtroActual;
      
      if (filtroParam && filtroParam !== 'ultimos_7_dias') {
        params.append('filtro', filtroParam);
      }
      
      if (filtroParam === 'personalizado' && (inicio || fechaInicio) && (fin || fechaFin)) {
        params.append('fecha_inicio', inicio || fechaInicio);
        params.append('fecha_fin', fin || fechaFin);
      }
      
      const url = params.toString() 
        ? `/dashboard/estadisticas/?${params.toString()}` 
        : '/dashboard/estadisticas/';
      
      const data = await axiosInstance.get(url).then(r => r.data);
      setStats(data);
      setError('');
    } catch (err: any) {
      console.error('Error cargando estadísticas:', err);
      setError(err.response?.data?.detail || 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    
    // Auto-actualizar cada 30 segundos solo si no es filtro personalizado
    if (filtroActual !== 'personalizado') {
      const interval = setInterval(() => loadStats(), 30000);
      return () => clearInterval(interval);
    }
  }, [filtroActual, fechaInicio, fechaFin]);

  // Manejadores de filtros
  const handleFiltroChange = (nuevoFiltro: FiltroFecha) => {
    setFiltroActual(nuevoFiltro);
    if (nuevoFiltro !== 'personalizado') {
      setFechaInicio('');
      setFechaFin('');
      loadStats(nuevoFiltro);
    }
  };

  const handleFiltroPersonalizado = () => {
    if (fechaInicio && fechaFin) {
      if (fechaInicio > fechaFin) {
        alert('❌ La fecha de inicio no puede ser mayor que la fecha de fin');
        return;
      }
      loadStats('personalizado', fechaInicio, fechaFin);
    } else {
      alert('❌ Selecciona ambas fechas');
    }
  };

  // Función de exportación a Excel
  const exportarExcel = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      params.append('filtro', filtroActual);
      
      if (filtroActual === 'personalizado' && fechaInicio && fechaFin) {
        params.append('fecha_inicio', fechaInicio);
        params.append('fecha_fin', fechaFin);
      }
      
      const response = await axiosInstance.get(
        `/dashboard/exportar-excel/?${params.toString()}`,
        { responseType: 'blob' }
      );
      
      // Crear URL y descargar
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const fecha = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `reporte_ventas_${fecha}.xlsx`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      alert('✅ Reporte descargado exitosamente');
    } catch (err: any) {
      console.error('Error:', err);
      alert('❌ Error al exportar reporte');
    } finally {
      setLoading(false);
    }
  };

  // Función para generar datos de prueba
  const generarDatosPrueba = async () => {
    if (!window.confirm('⚠️ ¿Generar datos de prueba para los últimos 7 días?\n\nEsto creará pedidos ficticios para probar el dashboard.')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await axiosInstance.post('/test/generar-datos/');
      alert(`✅ ${response.data.mensaje}\n\nPedidos creados: ${response.data.total_pedidos}`);
      await loadStats();
    } catch (err: any) {
      console.error('Error:', err);
      alert('❌ Error al generar datos de prueba:\n' + (err.response?.data?.error || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar datos de prueba
  const eliminarDatosPrueba = async () => {
    if (!window.confirm('⚠️ ¿Eliminar TODOS los pedidos de prueba?\n\nEsta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await axiosInstance.delete('/test/generar-datos/');
      alert(` ${response.data.mensaje}`);
      await loadStats();
    } catch (err: any) {
      console.error('Error:', err);
      alert('X Error al eliminar datos de prueba');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) {
    return (
      <>
      <Navbar />
      <div className="dashboard-container">
        <div className="loading">Cargando estadísticas...</div>
      </div>
      </>
    );
  }

  if (error) {
    return (
      <>
      <Navbar />
      <div className="dashboard-container">
        <div className="error-message">{error}</div>
      </div>
      </>
    );
  }

  if (!stats) return null;

  return (
    <>
    <Navbar />
    <div className="dashboard-container">
      <h1>Dashboard de Ventas</h1>
      
      {/* Panel de filtros */}
      <div className="filters-panel">
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filtroActual === 'ultimos_7_dias' ? 'active' : ''}`}
            onClick={() => handleFiltroChange('ultimos_7_dias')}
            disabled={loading}
          >
             Últimos 7 días
          </button>
          <button
            className={`filter-btn ${filtroActual === 'ultimos_30_dias' ? 'active' : ''}`}
            onClick={() => handleFiltroChange('ultimos_30_dias')}
            disabled={loading}
          >
             Últimos 30 días
          </button>
          <button
            className={`filter-btn ${filtroActual === 'este_mes' ? 'active' : ''}`}
            onClick={() => handleFiltroChange('este_mes')}
            disabled={loading}
          >
             Este mes
          </button>
          <button
            className={`filter-btn ${filtroActual === 'mes_pasado' ? 'active' : ''}`}
            onClick={() => handleFiltroChange('mes_pasado')}
            disabled={loading}
          >
             Mes pasado
          </button>
          <button
            className={`filter-btn ${filtroActual === 'personalizado' ? 'active' : ''}`}
            onClick={() => handleFiltroChange('personalizado')}
            disabled={loading}
          >
             Personalizado
          </button>
        </div>
      
        
        {/* Filtro personalizado */}
        {filtroActual === 'personalizado' && (
          <div className="custom-date-filter">
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="date-input"
              max={fechaFin || undefined}
            />
            <span>hasta</span>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="date-input"
              min={fechaInicio || undefined}
            />
            <button 
              onClick={handleFiltroPersonalizado} 
              className="apply-filter-btn"
              disabled={!fechaInicio || !fechaFin || loading}
            >
              Aplicar
            </button>
          </div>
        
        )}
        
        {/* Botón de exportar */}
        <button onClick={exportarExcel} className="export-btn" disabled={loading}>
          <img src="images/Excel.png" alt="Excel" className="export-icon" />
          Exportar a Excel
        </button>
        </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Ventas Hoy</h3>
          <p className="stat-value">Q{stats.ventas.total_ventas_hoy.toFixed(2)}</p>
          <p className="stat-subtitle">{stats.ventas.pedidos_hoy} pedidos</p>
        </div>
        
        <div className="stat-card">
          <h3>Ventas Esta Semana</h3>
          <p className="stat-value">Q{stats.ventas.total_ventas_semana.toFixed(2)}</p>
          <p className="stat-subtitle">{stats.ventas.pedidos_semana} pedidos</p>
        </div>

        <div className="stat-card">
          <h3>Ventas Este Mes</h3>
          <p className="stat-value">Q{stats.ventas.total_ventas_mes.toFixed(2)}</p>
          <p className="stat-subtitle">{stats.ventas.pedidos_mes} pedidos</p>
        </div>
      </div>
      
      <div className="section">
        <h2>Pedidos por Estado</h2>
        <div className="estado-grid">
          {Object.entries(stats.ventas.pedidos_por_estado).map(([estado, cantidad]) => (
            <div key={estado} className="estado-item">
              <span className="estado-label">{estado}</span>
              <span className="estado-count">{cantidad}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="section">
        <h2>Top 5 Productos Más Vendidos (Este Mes)</h2>
        {stats.top_productos.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Cantidad Vendida</th>
                <th>Total Q</th>
              </tr>
            </thead>
            <tbody>
              {stats.top_productos.map((producto) => (
                <tr key={producto.pilon_id}>
                  <td>{producto.nombre_variedad}</td>
                  <td>{producto.categoria}</td>
                  <td>{producto.cantidad_vendida}</td>
                  <td>Q{producto.total_vendido.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="empty-message">No hay ventas este mes aún</p>
        )}
      </div>

      <div className="section alert-section">
        <h2>Inventario Crítico (Stock Bajo)</h2>
        {stats.stock_bajo.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Stock Actual</th>
                <th>Stock Mínimo</th>
                <th>%</th>
              </tr>
            </thead>
            <tbody>
              {stats.stock_bajo.map((producto) => (
                <tr key={producto.id} className="alert-row">
                  <td>{producto.nombre_variedad}</td>
                  <td>{producto.categoria}</td>
                  <td>{producto.stock}</td>
                  <td>{producto.stock_minimo}</td>
                  <td>
                    <span className={`badge ${producto.porcentaje_stock < 50 ? 'danger' : 'warning'}`}>
                      {producto.porcentaje_stock.toFixed(0)}%
                    </span>
                  </td>
                </tr>
                
              ))}
            </tbody>
          </table>
        ) : (
          <p className="success-message">Todos los productos tienen stock suficiente</p>
        )}
      </div>

      {/*SECCIÓN DE GRÁFICA CON LÍNEAS DE REFERENCIA */}
      <div className="section">
      <h2>
        {filtroActual === 'ultimos_7_dias' && 'Ventas de los Últimos 7 Días'}
        {filtroActual === 'ultimos_30_dias' && 'Ventas de los Últimos 30 Días'}
        {filtroActual === 'este_mes' && 'Ventas de Este Mes'}
        {filtroActual === 'mes_pasado' && 'Ventas del Mes Pasado'}
        {filtroActual === 'personalizado' && 'Ventas del Período Seleccionado'}
      </h2>
      
      {/*  Wrapper con clase condicional */}
      <div className={`chart-scroll-wrapper ${stats.ventas_diarias && stats.ventas_diarias.length <= 7 ? 'no-scroll' : ''}`}>
        <div className="chart-wrapper">
          {/* Líneas de referencia */}
          <div className="chart-grid-lines">
            <div className="grid-line"><span className="grid-label">100%</span></div>
            <div className="grid-line"><span className="grid-label">75%</span></div>
            <div className="grid-line"><span className="grid-label">50%</span></div>
            <div className="grid-line"><span className="grid-label">25%</span></div>
          </div>
          
          {/*  Gráfica con clase condicional */}
          <div className={`chart-container ${stats.ventas_diarias && stats.ventas_diarias.length <= 7 ? 'few-days' : ''}`}>
          {stats.ventas_diarias && stats.ventas_diarias.length > 0 ? (
            (() => {
              //  CALCULAR EL MÁXIMO UNA SOLA VEZ FUERA DEL MAP
              const maxVentaReal = Math.max(...stats.ventas_diarias.map(d => d.total), 1);
              const maxVenta = maxVentaReal * 1.15;
              
              
              
              return stats.ventas_diarias.map((dia) => {
                //  Calcular altura proporcional
                const altura = (dia.total / maxVenta) * 100;
                const alturaFinal = dia.cantidad_pedidos > 0 ? Math.max(altura, 8) : 5;
                
                
                
                return (
                  <div key={dia.fecha} className="chart-bar-wrapper">
                    <div 
                      className="chart-bar" 
                      style={{ 
                        height: `${alturaFinal}%`,  //Ajuste de altura minima
                        background: dia.cantidad_pedidos > 0 
                          ? 'linear-gradient(135deg, #8BC34A, #689F38)' 
                          : '#e2e8f0'
                      }}
                    >
                      <span className="bar-value">
                        Q{dia.total.toFixed(0)}
                      </span>
                    </div>
                    <span className="bar-label">
                      {new Date(dia.fecha + 'T12:00:00').toLocaleDateString('es-GT', { 
                        day: '2-digit', 
                        month: 'short' 
                      })}
                    </span>
                    <span className="bar-sublabel">
                      {dia.cantidad_pedidos} pedidos
                    </span>
                  </div>
                );
              });
            })()
          ) : (
            <p className="empty-message">No hay datos de ventas disponibles</p>
          )}
        </div>
        </div>
      </div>
      
      {/*  Indicador solo si hay más de 10 días */}
      {stats.ventas_diarias && stats.ventas_diarias.length > 10 && (
        <p className="chart-scroll-indicator">
          Desliza para ver más datos
        </p>
      )}
      
      {stats.ventas_diarias && stats.ventas_diarias.length > 0 && (
        <p className="chart-info">
          Del {new Date(stats.ventas_diarias[0].fecha + 'T12:00:00').toLocaleDateString('es-GT')} al {new Date(stats.ventas_diarias[stats.ventas_diarias.length - 1].fecha + 'T12:00:00').toLocaleDateString('es-GT')}
        </p>
      )}
    </div>

      <p className="update-info">
        🔄 Actualización automática cada 30 segundos
      </p>

      {/* Botones de Prueba */}
      <div className="test-buttons">
        <button 
          onClick={generarDatosPrueba}
          disabled={loading}
          className="test-button generate"
        >
          🧪 Generar Datos de Prueba
        </button>
        
        <button 
          onClick={eliminarDatosPrueba}
          disabled={loading}
          className="test-button delete"
        >
          🗑️ Eliminar Datos de Prueba
        </button>
      </div>
    </div>
    </>
  );
}