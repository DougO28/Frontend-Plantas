// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';  
import ForgotPassword from './pages/ForgotPassword';  
import Home from './pages/Home';
import PlantList from './pages/PlantList';
import OrderList from './pages/OrderList';
import CreateOrder from './pages/CreateOrder';
import Dashboard from './pages/Dashboard';  
import './App.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
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

            {/* Ruta por defecto */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;