// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer'; // ✅ IMPORTAR FOOTER
import Login from './pages/Login';
import Register from './pages/Register';  
import ForgotPassword from './pages/ForgotPassword';  
import Home from './pages/Home';
import PlantList from './pages/PlantList';
import OrderList from './pages/OrderList';
import CreateOrder from './pages/CreateOrder';
import Dashboard from './pages/Dashboard';

// ✅ Logística
import LogisticaDashboard from './pages/LogisticaDashboard';
import ListaRutas from './pages/ListaRutas';
import CrearRuta from './pages/CrearRuta';
import DetalleRuta from './pages/DetalleRuta';
import GestionVehiculos from './pages/GestionVehiculos';
import PedidosListos from './pages/PedidosListos';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          {/* ✅ Contenedor principal con flexbox */}
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* ✅ Contenido principal que crece para empujar el footer al fondo */}
            <div style={{ flex: 1 }}>
              <Routes>
                {/* Rutas públicas */}
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Register />} /> 
                <Route path="/forgot-password" element={<ForgotPassword />} />  

                {/* Rutas protegidas */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Home />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/plantas"
                  element={
                    <ProtectedRoute>
                      <PlantList />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/pedidos"
                  element={
                    <ProtectedRoute>
                      <OrderList />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/pedidos/nuevo"
                  element={
                    <ProtectedRoute>
                      <CreateOrder />
                    </ProtectedRoute>
                  }
                />

                {/* ✅ LOGÍSTICA - Dashboard Principal */}
                <Route
                  path="/logistica"
                  element={
                    <ProtectedRoute>
                      <LogisticaDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* ✅ LOGÍSTICA - Rutas */}
                <Route
                  path="/logistica/rutas"
                  element={
                    <ProtectedRoute>
                      <ListaRutas />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/logistica/rutas/nueva"
                  element={
                    <ProtectedRoute>
                      <CrearRuta />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/logistica/rutas/:id"
                  element={
                    <ProtectedRoute>
                      <DetalleRuta />
                    </ProtectedRoute>
                  }
                />

                {/* ✅ LOGÍSTICA - Vehículos */}
                <Route
                  path="/logistica/vehiculos"
                  element={
                    <ProtectedRoute>
                      <GestionVehiculos />
                    </ProtectedRoute>
                  }
                />

                {/* ✅ LOGÍSTICA - Pedidos Listos */}
                <Route
                  path="/logistica/pedidos-listos"
                  element={
                    <ProtectedRoute>
                      <PedidosListos />
                    </ProtectedRoute>
                  }
                />

                {/* Ruta por defecto */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
            
            
            <Footer />
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;