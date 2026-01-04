import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Cerrarsesion() {
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Eliminar datos del usuario (ej. localStorage o cookies)
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // 2. Puedes agregar lógica adicional como cerrar sockets o limpiar estados globales

    // 3. Redirigir al login o página principal
    navigate('/');
  }, [navigate]);

  return (
    <div>
      <p>Cerrando sesión...</p>
    </div>
  );
}

export default Cerrarsesion;