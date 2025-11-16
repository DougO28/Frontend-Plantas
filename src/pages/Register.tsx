// src/pages/Register.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ubicacionService } from '../api/ubicacionService';
import '../styles/Register.css';

interface Departamento {
  id: number;
  nombre: string;
}

interface Municipio {
  id: number;
  nombre: string;
  departamento: number;
}

export default function Register() {
  const [formData, setFormData] = useState({
    nombre_completo: '',
    email: '',
    telefono: '',
    password: '',
    confirm_password: '',
    direccion: '',
    municipio: '',
  });

  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [municipiosFiltrados, setMunicipiosFiltrados] = useState<Municipio[]>([]);
  const [selectedDepartamento, setSelectedDepartamento] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingUbicaciones, setLoadingUbicaciones] = useState(true);
  
  const navigate = useNavigate();
  const { register } = useAuth();

  // Cargar departamentos y municipios con mejor manejo de errores
  useEffect(() => {
    const fetchUbicaciones = async () => {
      setLoadingUbicaciones(true);
      try {
        const [deptosData, muniData] = await Promise.all([
          ubicacionService.getDepartamentos(),
          ubicacionService.getMunicipios(),
        ]);

        setDepartamentos(deptosData);
        setMunicipios(muniData);
      } catch (err: any) {
        console.error('Error cargando ubicaciones:', err);
        setError('Error al cargar las ubicaciones. Por favor, recarga la página.');
      } finally {
        setLoadingUbicaciones(false);
      }
    };

    fetchUbicaciones();
  }, []);

  // Filtrar municipios por departamento
  useEffect(() => {
    if (selectedDepartamento) {
      const filtered = municipios.filter(
        (m) => m.departamento === parseInt(selectedDepartamento)
      );
      setMunicipiosFiltrados(filtered);
    } else {
      setMunicipiosFiltrados([]);
    }
  }, [selectedDepartamento, municipios]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('');
  };

  const handleDepartamentoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDepartamento(e.target.value);
    setFormData((prev) => ({ ...prev, municipio: '' }));
    if (error) setError('');
  };

  const validateForm = () => {
    // Validar campos requeridos
    if (!formData.nombre_completo.trim()) {
      setError('El nombre completo es requerido');
      return false;
    }

    if (!formData.email.trim()) {
      setError('El correo electrónico es requerido');
      return false;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Ingresa un correo electrónico válido');
      return false;
    }

    if (!formData.telefono.trim()) {
      setError('El teléfono es requerido');
      return false;
    }

    if (!formData.password) {
      setError('La contraseña es requerida');
      return false;
    }

    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return false;
    }

    if (formData.password !== formData.confirm_password) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    if (!selectedDepartamento) {
      setError('Debes seleccionar un departamento');
      return false;
    }

    if (!formData.municipio) {
      setError('Debes seleccionar un municipio');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      await register({
        nombre_completo: formData.nombre_completo.trim(),
        email: formData.email.trim().toLowerCase(),
        telefono: formData.telefono.trim(),
        password: formData.password,
        confirm_password: formData.confirm_password,
        direccion: formData.direccion.trim(),
        municipio: parseInt(formData.municipio),
      });

      setSuccess(true);
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err: any) {
      console.error('Error en registro:', err);
      
      // Manejo mejorado de errores
      let errorMsg = 'Error al registrar usuario. Intenta nuevamente.';
      
      if (err?.response?.data) {
        const data = err.response.data;
        
        // Manejar errores específicos del backend
        if (data.email) {
          errorMsg = Array.isArray(data.email) ? data.email[0] : 'Este correo ya está registrado';
        } else if (data.telefono) {
          errorMsg = Array.isArray(data.telefono) ? data.telefono[0] : 'Este teléfono ya está registrado';
        } else if (data.detail) {
          errorMsg = data.detail;
        } else if (data.message) {
          errorMsg = data.message;
        } else if (typeof data === 'string') {
          errorMsg = data;
        }
      } else if (err?.message) {
        if (err.message.includes('timeout')) {
          errorMsg = 'La solicitud está tomando más tiempo de lo esperado. Por favor, intenta de nuevo.';
        } else if (err.message.includes('Network Error')) {
          errorMsg = 'Error de conexión. Verifica tu internet e intenta nuevamente.';
        } else {
          errorMsg = err.message;
        }
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="register-page">
        <div className="register-card">
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h2>Registro Exitoso</h2>
            <p>Tu cuenta ha sido creada correctamente.</p>
            <p>Redirigiendo al inicio de sesión...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-header">
          <h1 className="register-title">Crear Cuenta</h1>
          <p className="register-subtitle">
            Completa el formulario para registrarte en Agriconecta
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠ </span>
            {error}
          </div>
        )}

        {loadingUbicaciones && (
          <div className="alert alert-info">
            <span className="alert-icon">ℹ </span>
            Cargando ubicaciones...
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          {/* Información Personal */}
          <div className="form-section">
            <h3 className="section-title">Información Personal</h3>

            <div className="form-group">
              <label htmlFor="nombre_completo">
                Nombre Completo <span className="req">*</span>
              </label>
              <input
                id="nombre_completo"
                name="nombre_completo"
                type="text"
                value={formData.nombre_completo}
                onChange={handleChange}
                placeholder="Juan Pérez"
                required
                disabled={loading}
                autoComplete="name"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">
                  Correo Electrónico <span className="req">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="correo@ejemplo.com"
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="telefono">
                  Teléfono <span className="req">*</span>
                </label>
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="1234-5678"
                  required
                  disabled={loading}
                  autoComplete="tel"
                />
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div className="form-section">
            <h3 className="section-title">Ubicación</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="departamento">
                  Departamento <span className="req">*</span>
                </label>
                <select
                  id="departamento"
                  value={selectedDepartamento}
                  onChange={handleDepartamentoChange}
                  required
                  disabled={loading || loadingUbicaciones}
                >
                  <option value="">Selecciona un departamento</option>
                  {departamentos.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="municipio">
                  Municipio <span className="req">*</span>
                </label>
                <select
                  id="municipio"
                  name="municipio"
                  value={formData.municipio}
                  onChange={handleChange}
                  required
                  disabled={loading || loadingUbicaciones || !selectedDepartamento}
                >
                  <option value="">
                    {selectedDepartamento ? 'Selecciona un municipio' : 'Primero selecciona un departamento'}
                  </option>
                  {municipiosFiltrados.map((muni) => (
                    <option key={muni.id} value={muni.id}>
                      {muni.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="direccion">Dirección</label>
              <input
                id="direccion"
                name="direccion"
                type="text"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Zona 10, 5ta Avenida"
                disabled={loading}
                autoComplete="street-address"
              />
            </div>
          </div>

          {/* Seguridad */}
          <div className="form-section">
            <h3 className="section-title">Seguridad</h3>

            <div className="form-group">
              <label htmlFor="password">
                Contraseña <span className="req">*</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mínimo 8 caracteres"
                  required
                  disabled={loading}
                  minLength={8}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  tabIndex={-1}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirm_password">
                Confirmar Contraseña <span className="req">*</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="Repite tu contraseña"
                  required
                  disabled={loading}
                  minLength={8}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <p className="password-hint">
              La contraseña debe tener al menos 8 caracteres
            </p>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/login')}
              disabled={loading}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading || loadingUbicaciones}>
              {loading ? 'Registrando...' : 'Crear Cuenta'}
            </button>
          </div>

          <p className="login-link">
            ¿Ya tienes cuenta? <a href="/login">Inicia sesión aquí</a>
          </p>
        </form>
      </div>
    </div>
  );
}