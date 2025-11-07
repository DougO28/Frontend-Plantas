// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';

interface LoginProps {
  onLoginSuccess?: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      onLoginSuccess?.();
      navigate('/');
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          'Error al iniciar sesión. Verifica tus credenciales.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <img
            className="login-logo"
            src="/images/logo-agriconecta.svg"
            alt="Agriconecta"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <h1 className="login-title">Ingresa a tu Cuenta</h1>
        </div>

        <div className="login-columns">
          <div className="login-col">
            <h3 className="col-title">Clientes Registrados</h3>
            <p className="col-subtitle">
              Si tienes una cuenta, inicia sesión con tu dirección de correo
              electrónico.
            </p>

            {error && (
              <div className="alert alert-error">
                <span className="alert-icon">⚠</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email">
                  Correo Electrónico <span className="req">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  Contraseña <span className="req">*</span>
                </label>
                <div className="password-input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? 'ver' : '*'}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                  />
                  <span>Ver contraseña</span>
                </label>
                <button
                  type="button"
                  className="forgot-password"
                  onClick={() => navigate('/forgot-password')}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>

              <p className="required-hint">
                <span className="req">*</span> Campos obligatorios.
              </p>
            </form>
          </div>

          <div className="login-divider" aria-hidden="true" />

          <div className="login-col create-col">
            <h3 className="col-title">Crea tu Cuenta</h3>
            <p className="col-subtitle">
              Crea tu cuenta y encuentra servicios como: Gestión de pedidos,
              seguimiento de envíos, historial de compras y más.
            </p>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/registro')}
            >
              Crear una Cuenta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}