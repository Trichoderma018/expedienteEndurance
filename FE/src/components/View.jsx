import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import { mapExpedienteFromBackend } from '../services/dataMapper';
import { obtenerUrlImagen } from '../utils/fileUpload';
import { useNavigate } from 'react-router-dom';
import CardsVisita from './CardsVisita';
import '../style/View.css';

{/* Editado */}

function View() {
    const [expediente, setExpediente] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        cargarExpediente();
    }, []);

    const cargarExpediente = async () => {
        const expedienteId = localStorage.getItem('id');
        
        if (!expedienteId) {
            setError('No se encontró el ID del expediente');
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            
            // Obtener expediente por ID
            const data = await apiService.getData(`expedientes/${expedienteId}/`);
            
            console.log('Expediente recibido:', data);
            
            // Mapear datos del backend al frontend
            const expedienteMapeado = mapExpedienteFromBackend(data);
            
            console.log('Expediente mapeado:', expedienteMapeado);
            
            setExpediente(expedienteMapeado);

        } catch (error) {
            console.error('Error cargando expediente:', error);
            
            let errorMessage = 'Error al cargar la información del expediente';
            
            if (error.response?.status === 404) {
                errorMessage = 'Expediente no encontrado';
            } else if (error.response?.status === 401) {
                errorMessage = 'Sesión expirada. Redirigiendo...';
                setTimeout(() => apiService.logout(), 2000);
            }
            
            setError(errorMessage);
            
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditar = () => {
        // Guardar datos para modo edición
        localStorage.setItem('expedienteEditar', JSON.stringify(expediente));
        localStorage.setItem('modoEdicion', 'true');
        navigate('/agregar');
    };

    const handleVolver = () => {
        navigate('/expediente');
    };

    const handleCrearVisita = () => {
        // Guardar ID para preseleccionar en formulario de visita
        localStorage.setItem('expedienteParaVisita', expediente.id);
        navigate('/visita');
    };

    if (isLoading) {
        return (
            <div className="view-container">
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Cargando información del expediente...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="view-container">
                <div className="error-container">
                    <div className="error">{error}</div>
                    <button onClick={handleVolver} className="btn-volver">
                        Volver a Expedientes
                    </button>
                </div>
            </div>
        );
    }

    if (!expediente) {
        return (
            <div className="view-container">
                <div className="error-container">
                    <div className="error">No se encontró el expediente</div>
                    <button onClick={handleVolver} className="btn-volver">
                        Volver a Expedientes
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="view-container">
            <div className="view-header">
                <button onClick={handleVolver} className="btn-volver">
                    ← Volver
                </button>
                <h1>Expediente Endurance</h1>
                <button onClick={handleEditar} className="btn-editar">
                    Editar
                </button>
            </div>

            <div className="expediente-card">
                {/* Imagen */}
                {expediente.imagen && (
                    <div className="info-section">
                        <h2>Imagen del Atleta</h2>
                        <div className="image-container">
                            <img 
                                src={obtenerUrlImagen(expediente.imagen)} 
                                alt="Expediente" 
                                className="expediente-imagen"
                                onError={(e) => {
                                    console.error('Error cargando imagen:', expediente.imagen);
                                    e.target.style.display = 'none';
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Información General */}
                <div className="info-section">
                    <h2>Información General</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="label">Nombre:</span>
                            <span className="value">
                                {expediente.nombreCompleto || 'No disponible'}
                            </span>
                        </div>
                        <div className="info-item">
                            <span className="label">Estado:</span>
                            <span className={`value status ${expediente.activo ? 'activo' : 'inactivo'}`}>
                                {expediente.activo ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>
                        <div className="info-item">
                            <span className="label">Género:</span>
                            <span className="value">
                                {expediente.genero === 'masculino' ? 'Masculino' : 
                                 expediente.genero === 'femenino' ? 'Femenino' : 'Otro'}
                            </span>
                        </div>
                        <div className="info-item">
                            <span className="label">Sede:</span>
                            <span className="value">{expediente.sede || 'No especificada'}</span>
                        </div>
                        {expediente.fechaExpediente && (
                            <div className="info-item">
                                <span className="label">Fecha de creación:</span>
                                <span className="value">{expediente.fechaExpediente}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Comentarios */}
                {(expediente.comentario1 || expediente.comentario2 || expediente.comentario3) && (
                    <div className="info-section">
                        <h2>Comentarios</h2>
                        <div className="comentarios-grid">
                            {expediente.comentario1 && (
                                <div className="comentario-item">
                                    <span className="comentario-label">Comentario General:</span>
                                    <p className="comentario-texto">{expediente.comentario1}</p>
                                </div>
                            )}
                            {expediente.comentario2 && (
                                <div className="comentario-item">
                                    <span className="comentario-label">Comentario Académico:</span>
                                    <p className="comentario-texto">{expediente.comentario2}</p>
                                </div>
                            )}
                            {expediente.comentario3 && (
                                <div className="comentario-item">
                                    <span className="comentario-label">Comentario Económico:</span>
                                    <p className="comentario-texto">{expediente.comentario3}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Botón Crear Visita */}
                <div className="actions-section">
                    <button onClick={handleCrearVisita} className="btn-visita">
                        Crear Nueva Visita
                    </button>
                </div>

                {/* Visitas del Expediente */}
                <CardsVisita expedienteId={expediente.id} />
            </div>
        </div>
    );
}

export default View;