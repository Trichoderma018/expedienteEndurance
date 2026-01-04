import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import { mapExpedienteFromBackend } from '../services/dataMapper';
import { useNavigate } from 'react-router-dom';
import '../style/Expediente.css';

import Navbar from './Navbar';
import Cards from './Cards';
import Search from './Search';

{/* Editado */}

function Expediente() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expedientes, setExpedientes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    obtenerExpedientes();
  }, []);

  const obtenerExpedientes = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Obtener expedientes con el nuevo API
      const data = await apiService.getData('expedientes/');
      
      console.log('Expedientes recibidos:', data);
      
      // Mapear datos del backend al formato del frontend
      const expedientesMapeados = data.map(mapExpedienteFromBackend);
      
      console.log('Expedientes mapeados:', expedientesMapeados);
      
      setExpedientes(expedientesMapeados);
      
    } catch (err) {
      console.error('Error al obtener expedientes:', err);
      
      let errorMessage = 'Hubo un problema al cargar los datos.';
      
      if (err.response?.status === 401) {
        errorMessage = 'Sesión expirada. Redirigiendo al login...';
        setTimeout(() => {
          apiService.logout();
        }, 2000);
      } else if (err.response?.status === 403) {
        errorMessage = 'No tienes permisos para ver los expedientes.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className='static'>
        <Navbar />

        <label className='borrado'></label>

        <div className='tablita'>
          <Search />
          <button 
            className='buttong' 
            onClick={() => navigate('/agregar')}
          >
            Agregar +
          </button>
        </div>
        
        <br />
        <h2>Lista de Expedientes</h2>
        <hr />
      </div>
    
      <div className="registro-container">
        {isLoading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="mensaje-cargando">Cargando expedientes...</p>
          </div>
        )}
        
        {error && (
          <div className="error-container">
            <p className="mensaje-error">{error}</p>
            <button 
              onClick={obtenerExpedientes}
              className="btn-retry"
            >
              Reintentar
            </button>
          </div>
        )}

        {!isLoading && !error && expedientes.length > 0 && expedientes.map((expediente) => (
          <Cards
            key={expediente.id}
            id={expediente.id}
            imagen={expediente.imagen}
            descripcion={expediente.comentario1 || 'Sin descripción'}
            nombre={expediente.nombreCompleto}
            rol={expediente.rol}
          />
        ))}

        {!isLoading && !error && expedientes.length === 0 && (
          <div className="empty-state">
            <p className="mensaje-vacio">No hay expedientes disponibles.</p>
            <button 
              className="btn-create-first"
              onClick={() => navigate('/agregar')}
            >
              Crear primer expediente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Expediente;