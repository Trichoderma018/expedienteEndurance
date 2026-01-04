import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/login.css';
import apiService from '../services/apiService';
import Logo from '../assets/img/Logo.jpeg';
import ResetPassword from './ResetPassword';
import Swal from 'sweetalert2';

{/* Editado */}

const FormLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Usar el nuevo servicio de API
      const response = await apiService.login(username, password);
      
      console.log('Login exitoso:', response);

      // Mostrar mensaje de éxito
      Swal.fire({
        title: "Inicio de sesión exitoso",
        text: `Bienvenido ${response.user.nombre_completo || response.user.username}`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });

      // Redirigir a expedientes
      setTimeout(() => {
        navigate('/Expediente');
      }, 1500);

    } catch (error) {
      console.error('Error during login:', error);
      
      // Manejar diferentes tipos de errores
      let errorMessage = 'Error de conexión, por favor intenta más tarde.';
      
      if (error.response) {
        // Error con respuesta del servidor
        if (error.response.status === 401) {
          errorMessage = 'Usuario o contraseña incorrectos.';
        } else if (error.response.status === 403) {
          errorMessage = 'Tu cuenta está inactiva. Contacta al administrador.';
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        }
      }
      
      setError(errorMessage);
      
      Swal.fire({
        title: "Error de inicio de sesión",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "Intentar de nuevo"
      });
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <img className="logo" src={Logo} alt="Logo" />
        
        <h2 className="form-heading">Iniciar Sesión</h2>
        
        <div className="input-group">
          <label htmlFor="username">Usuario</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ingresa tu usuario"
            required
            disabled={loading}
          />
        </div>
        
        <div className="input-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ingresa tu contraseña"
            required
            disabled={loading}
          />
        </div>
        
        {error && <p className="error-message">{error}</p>}
        
        <button 
          className="submit" 
          type="submit" 
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Cargando...
            </>
          ) : (
            'Iniciar Sesión'
          )}
        </button>
        
        <div className="forgot-password">
          <a href="#" onClick={openModal}>¿Olvidaste tu contraseña?</a>
        </div>
        
        <div className="signup-link" onClick={() => navigate('/register')}>
          ¿No tienes cuenta? <a href="#">Regístrate</a>
        </div>
      </form>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="modal-close" onClick={closeModal}>
              ✖
            </button>
            <ResetPassword onClose={closeModal} />
          </div>
        </div>
      )}
    </div>
  );
};

export default FormLogin;