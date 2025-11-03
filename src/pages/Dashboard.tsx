// pagina de metricas y las estadisticas 
import { useState, useEffect } from 'react';
import { dashboardService, type DashboardEstadisticas } from '../api/dashboardService';
import Navbar from '../components/Navbar';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardEstadisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getEstadisticas();
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
    
    // Auto-actualizar cada 30 segundos
    const interval = setInterval(loadStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

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
      <h1> Dashboard de Ventas</h1>
      
      
      
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
          <h3> Ventas Este Mes</h3>
          <p className="stat-value">Q{stats.ventas.total_ventas_mes.toFixed(2)}</p>
          <p className="stat-subtitle">{stats.ventas.pedidos_mes} pedidos</p>
        </div>
      </div>
      

      
      <div className="section">
        <h2> Pedidos por Estado</h2>
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
        <h2> Top 5 Productos Más Vendidos (Este Mes)</h2>
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
        <h2> Inventario Crítico (Stock Bajo)</h2>
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
          <p className="success-message"> Todos los productos tienen stock suficiente</p>
        )}
      </div>

      
      <div className="section">
        <h2> Ventas de los Últimos 7 Días</h2>
        <div className="chart-container">
          {stats.ventas_diarias.map((dia) => {
            const maxVenta = Math.max(...stats.ventas_diarias.map(d => d.total));
            const altura = maxVenta > 0 ? (dia.total / maxVenta) * 100 : 0;
            
            return (
              <div key={dia.fecha} className="chart-bar-wrapper">
                <div className="chart-bar" style={{ height: `${altura}%` }}>
                  <span className="bar-value">Q{dia.total.toFixed(0)}</span>
                </div>
                <span className="bar-label">
                  {new Date(dia.fecha).toLocaleDateString('es-GT', { 
                    day: '2-digit', 
                    month: 'short' 
                  })}
                </span>
                <span className="bar-sublabel">{dia.cantidad_pedidos} pedidos</span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="update-info">
        🔄 Actualización automática cada 30 segundos
      </p>
    </div>
    </>
  );
}