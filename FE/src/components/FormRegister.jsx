import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import Logo from '../assets/img/Logo.jpeg';
import '../style/Register.css';
import Swal from 'sweetalert2';

  {/* Editado */}

function FormRegister() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const strengthLabels = ["", "Débil", "Moderada", "Buena", "Fuerte"];
  
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    sede: '',
    password: '',
    confirmPassword: ''
  });

  const evaluatePasswordStrength = (password) => {
    const conditions = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password),
    ];
    return conditions.filter(Boolean).length;
  };

  const passwordStrength =
    formData.password &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword
      ? evaluatePasswordStrength(formData.password)
      : 0;
  
  const strengthLabel = strengthLabels[passwordStrength];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (!formData.confirmPassword) {
      setError(null);
    } else {
      setError(formData.password === formData.confirmPassword ? null : 'Las contraseñas no coinciden.');
    }
  }, [formData.password, formData.confirmPassword]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validar campos
    if (!formData.username || !formData.sede || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Por favor completa todos los campos.');
      return;
    }
    
    if (!formData.first_name) {
      setError('Por favor ingresa tu nombre.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Preparar datos para el backend
      const registroData = {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name || '',
        sede: formData.sede,
        password: formData.password,
        password_confirm: formData.confirmPassword,
      };

      console.log('Enviando datos de registro:', registroData);

      const response = await apiService.registro(registroData);

      console.log('Usuario registrado exitosamente:', response);

      setTimeout(() => {
        setIsLoading(false);
        Swal.fire({
          title: "Registro Exitoso",
          text: "Tu cuenta ha sido creada correctamente. Ya puedes iniciar sesión.",
          icon: "success",
          confirmButtonText: "Ir al login"
        }).then(() => {
          navigate('/');
        });
      }, 1500);

    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Error al registrar. Por favor intenta de nuevo.';
      
      if (error.response?.data) {
        // Manejar errores específicos del backend
        const backendErrors = error.response.data;
        
        if (backendErrors.username) {
          errorMessage = 'Este nombre de usuario ya está en uso.';
        } else if (backendErrors.email) {
          errorMessage = 'Este correo electrónico ya está registrado.';
        } else if (backendErrors.password) {
          errorMessage = `Error de contraseña: ${backendErrors.password[0]}`;
        } else if (backendErrors.message) {
          errorMessage = backendErrors.message;
        }
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className='login-container'>
      <form className="login-form" onSubmit={handleSubmit}>
        <img src={Logo} alt="Logo" className="logo" />
        
        <div className="form-heading">Crear cuenta</div>
        
        <div className="input-group">
          <input 
            type="text" 
            id="username" 
            name="username" 
            value={formData.username} 
            onChange={handleChange} 
            required 
            disabled={isLoading}
          />
          <label htmlFor="username">Nombre de usuario</label>
        </div>
        
        <div className="input-group">
          <input 
            type="text" 
            id="first_name" 
            name="first_name" 
            value={formData.first_name} 
            onChange={handleChange} 
            required 
            disabled={isLoading}
          />
          <label htmlFor="first_name">Nombre</label>
        </div>
        
        <div className="input-group">
          <input 
            type="text" 
            id="last_name" 
            name="last_name" 
            value={formData.last_name} 
            onChange={handleChange} 
            disabled={isLoading}
          />
          <label htmlFor="last_name">Apellido (opcional)</label>
        </div>
        
        <div className="input-group">
          <input 
            type="text" 
            id="sede" 
            name="sede" 
            value={formData.sede} 
            onChange={handleChange} 
            required 
            disabled={isLoading}
          />
          <label htmlFor="sede">Sede</label>
        </div>
        
        <div className="input-group">
          <input 
            type="email" 
            id="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            required 
            disabled={isLoading}
          />
          <label htmlFor="email">Correo electrónico</label>
        </div>
        
        <div className="input-group">
          <input 
            type="password" 
            id="password" 
            name="password" 
            value={formData.password} 
            onChange={handleChange} 
            required 
            disabled={isLoading}
          />
          <label htmlFor="password">Contraseña</label>
        </div>
        
        <div className="input-group">
          <input 
            type="password" 
            id="confirmPassword" 
            name="confirmPassword" 
            value={formData.confirmPassword} 
            onChange={handleChange} 
            required 
            disabled={isLoading}
          />
          <label htmlFor="confirmPassword">Confirmar contraseña</label>
        </div>

        {formData.password &&
          formData.confirmPassword &&
          formData.password === formData.confirmPassword && (
            <div className="password-strength">
              Seguridad de contraseña: <strong>{strengthLabel}</strong>
            </div>
          )}

        {error && <p className="error-message">{error}</p>}

        <button 
          className="submit" 
          type="submit" 
          disabled={isLoading || !!error}
        >
          {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
        
        {isLoading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <span className="loading-text">Cargando</span>
          </div>
        )}
        
        <div className="signup-link">
          ¿Ya tienes cuenta?{' '}
          <a href="#" onClick={() => navigate('/')}>Iniciar sesión</a>
        </div>
      </form>
    </div>
  );
}

export default FormRegister;