// src/components/Navbar.tsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import '../styles/Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const cartItemsCount = getTotalItems();

  return (
  <nav className="navbar">
    <div className="nav-content">
      <div className="nav-brand-container" onClick={() => navigate('/')}>
        <img src="/images/Agriconecta.png" alt="Logo" className="nav-logo" />
        <h1>Plantas Agriconecta</h1>
      </div>
      
      <div className="nav-links">
        <button onClick={() => navigate('/')} className="nav-link">
          Inicio
        </button>
        <button onClick={() => navigate('/dashboard')} className="nav-link">  
          Dashboard
        </button>
        <button onClick={() => navigate('/plantas')} className="nav-link">
          Plantas
        </button>
        <button onClick={() => navigate('/pedidos')} className="nav-link">
          Pedidos
        </button>
      </div>

        <div className="nav-right">
          {/* Botón del carrito */}
          <button onClick={() => navigate('/pedidos/nuevo')} className="cart-btn">
            <img src="/images/carritocompras.png" alt="Carrito" className="cart-icon" />
            {cartItemsCount > 0 && (
              <span className="cart-badge">{cartItemsCount}</span>
            )}
          </button>
          <span className="user-name">{user?.nombre_completo}</span>
          <button onClick={handleLogout} className="logout-btn">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
}