// src/pages/Home.tsx
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/Home.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <Navbar />
      <main className="main-content">
        <div className="welcome-section">
          <h2>¡Bienvenido a Plantas Agriconecta!</h2>
          <p>Gestiona tu negocio de plantas de forma eficiente</p>
        </div>

        <div className="cards-grid">
          <div className="card" onClick={() => navigate('/plantas')}>
            <div className="card-icon">
              <img src="/images/plantas.png" alt="Plantas" />
            </div>
            <h3>Catálogo de Plantas</h3>
            <p>Ver y gestionar el catálogo de pilones disponibles</p>
          </div>

          <div className="card" onClick={() => navigate('/pedidos')}>
            <div className="card-icon">
              <img src="/images/pedidos.png" alt="Pedidos" />
            </div>
            <h3>Mis Pedidos</h3>
            <p>Gestionar pedidos y hacer seguimiento</p>
          </div>

          <div className="card" onClick={() => navigate('/dashboard')}>
            <div className="card-icon">
              <img src="/images/dashboard.png" alt="Dashboard" />
            </div>
            <h3>Dashboard</h3>
            <p>Ver estadísticas y métricas del sistema</p>
          </div>

          <div className="card">
            <div className="card-icon">
              <img src="/images/camion.png" alt="Logística" />
            </div>
            <h3>Logística</h3>
            <p>Gestión de despachos y entregas</p>
          </div>
        </div>
      </main>
    </div>
  );
}