// src/pages/Register.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  
  const navigate = useNavigate();
  const { register } = useAuth();

  // Cargar departamentos y municipios
  useEffect(() => {
    const fetchUbicaciones = async () => {
      try {
        const [deptosRes, muniRes] = await Promise.all([
          fetch('http://localhost:8000/api/departamentos/'),
          fetch('http://localhost:8000/api/municipios/'),
        ]);

        const deptosData = await deptosRes.json();
        const muniData = await muniRes.json();

        setDepartamentos(deptosData);
        setMunicipios(muniData);
      } catch (err) {
        console.error('Error cargando ubicaciones:', err);
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
  };

  const handleDepartamentoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDepartamento(e.target.value);
    setFormData((prev) => ({ ...prev, municipio: '' }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirm_password) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
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
        nombre_completo: formData.nombre_completo,
        email: formData.email,
        telefono: formData.telefono,
        password: formData.password,
        confirm_password: formData.confirm_password,
        direccion: formData.direccion,
        municipio: parseInt(formData.municipio),
      });

      setSuccess(true);
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail || 
                      err?.response?.data?.email?.[0] ||
                      'Error al registrar usuario. Intenta nuevamente.';
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
            <span className="alert-icon">⚠</span>
            {error}
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
                  disabled={loading}
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
                  disabled={loading || !selectedDepartamento}
                >
                  <option value="">Selecciona un municipio</option>
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
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showConfirmPassword ? 'ver' : '*'}
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
            <button type="submit" className="btn-primary" disabled={loading}>
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