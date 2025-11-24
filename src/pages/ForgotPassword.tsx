// src/pages/ForgotPassword.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import '../styles/ForgotPassword.css';
import axiosInstance from '../api/axiosConfig';

export default function ForgotPassword() {
  const [step, setStep] = useState<'email' | 'code' | 'newPassword'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Generar código de 6 dígitos
  const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Paso 1: Enviar código por email
  const handleSendCode = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    // Verificar que el email existe en el sistema
    const response = await axiosInstance.get('/usuarios/', {
      params: { email: email }
    });
    const users = response.data;

    if (!users || users.length === 0) {
      setError('No existe una cuenta con este correo electrónico');
      setLoading(false);
      return;
    }

    const user = users[0];
    const resetCode = generateCode();
    setGeneratedCode(resetCode);

    // Enviar correo con EmailJS
    await emailjs.send(
      'service_yit3dwb',
      'template_6yuwmuy', // Template'
      {
        user_name: user.nombre_completo,
        to_email: email,
        reset_code: resetCode,
      },
      '6ZzdOia3VpMumzjDq' //Public Key
    );

    setStep('code');
    setError('');
  } catch (err) {
    setError('Error al enviar el código. Intenta nuevamente.');
  } finally {
    setLoading(false);
  }
};

  // Verificar código
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (code === generatedCode) {
      setStep('newPassword');
    } else {
      setError('Código incorrecto. Verifica e intenta nuevamente.');
    }
  };

// Cambiar contraseña
const handleResetPassword = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  if (newPassword !== confirmPassword) {
    setError('Las contraseñas no coinciden');
    return;
  }

  if (newPassword.length < 8) {
    setError('La contraseña debe tener al menos 8 caracteres');
    return;
  }

  setLoading(true);

  try {
    // Llamar al endpoint de reset de contraseña
    const response = await axiosInstance.post('/usuarios/reset_password/', {
      email: email,
      new_password: newPassword
    });

    // Enviar email de confirmación (opcional)
    try {
      await emailjs.send(
        'service_yit3dwb',
        'template_9zqkino',
        {
          user_name: response.data.usuario,
          to_email: email,
          reset_code: '✅ Tu contraseña ha sido restablecida exitosamente',
        },
        '6ZzdOia3VpMumzjDq'
      );
    } catch (emailError) {
      console.log('Error enviando email de confirmación:', emailError);
      // No detiene el flujo si falla el email
    }

    setSuccess(true);
    
    setTimeout(() => {
      navigate('/login');
    }, 2000);

  } catch (err: any) {
    console.error('Error al cambiar contraseña:', err);
    setError(
      err.response?.data?.error || 
      'Error al cambiar la contraseña. Intenta nuevamente.'
    );
  } finally {
    setLoading(false);
  }
};

  if (success) {
    return (
      <div className="forgot-password-page">
        <div className="forgot-password-card">
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h2>Contraseña Restablecida</h2>
            <p>Tu contraseña ha sido cambiada exitosamente.</p>
            <p>Redirigiendo al inicio de sesión...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <h1 className="forgot-password-title">Recuperar Contraseña</h1>
          <p className="forgot-password-subtitle">
            {step === 'email' && 'Ingresa tu correo electrónico para recibir un código'}
            {step === 'code' && 'Ingresa el código que enviamos a tu correo'}
            {step === 'newPassword' && 'Crea tu nueva contraseña'}
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠</span>
            {error}
          </div>
        )}

        {/* Ingresar email */}
        {step === 'email' && (
          <form onSubmit={handleSendCode} className="forgot-password-form">
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

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Código'}
            </button>

            <button
              type="button"
              className="btn-link"
              onClick={() => navigate('/login')}
            >
              Volver al inicio de sesión
            </button>
          </form>
        )}

        {/* Verificar código */}
        {step === 'code' && (
          <form onSubmit={handleVerifyCode} className="forgot-password-form">
            <div className="form-group">
              <label htmlFor="code">
                Código de Verificación <span className="req">*</span>
              </label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                required
                maxLength={6}
                className="code-input"
              />
              <p className="helper-text">
                Revisa tu correo: {email}
              </p>
            </div>

            <button type="submit" className="btn-primary">
              Verificar Código
            </button>

            <button
              type="button"
              className="btn-link"
              onClick={handleSendCode}
            >
              Reenviar código
            </button>
          </form>
        )}

        {/*  Nueva contraseña */}
        {step === 'newPassword' && (
          <form onSubmit={handleResetPassword} className="forgot-password-form">
            <div className="form-group">
              <label htmlFor="newPassword">
                Nueva Contraseña <span className="req">*</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                  disabled={loading}
                  minLength={8}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'ver' : '*'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                Confirmar Contraseña <span className="req">*</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  required
                  disabled={loading}
                  minLength={8}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? 'ver' : '*'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}