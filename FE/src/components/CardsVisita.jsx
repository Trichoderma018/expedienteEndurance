import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Llamados from '../services/Llamados';
import '../style/CardsVisita.css';

function CardsVisita({ expedienteId }) {
    const [visitas, setVisitas] = useState([]);
    const [mostrarVisitas, setMostrarVisitas] = useState(false);
    const [isLoadingVisitas, setIsLoadingVisitas] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const cargarVisitas = async () => {
        if (!expedienteId) return;
        
        setIsLoadingVisitas(true);
        setError(null);
        
        try {
            // Obtener todas las visitas
            const todasLasVisitas = await Llamados.getData('api/visitas/');
            
            // Filtrar las visitas que pertenecen a este expediente
            const visitasDelExpediente = todasLasVisitas.filter(
                visita => visita.expediente === parseInt(expedienteId)
            );
            
            setVisitas(visitasDelExpediente);
        } catch (error) {
            console.error('Error cargando visitas:', error);
            setError('Error al cargar las visitas');
        } finally {
            setIsLoadingVisitas(false);
        }
    };

    const handleMostrarVisitas = async () => {
        if (!mostrarVisitas) {
            await cargarVisitas();
        }
        setMostrarVisitas(!mostrarVisitas);
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return 'Fecha no disponible';
        
        try {
            const fechaObj = new Date(fecha);
            return fechaObj.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return 'Fecha no válida';
        }
    };

    const handleVerVisita = (visitaId) => {
        // Guardar el ID de la visita para ViewVisita
        localStorage.setItem('visitaId', visitaId);
        navigate('/view-visita');
    };

    return (
        <div className="cards-visita-container">
            <button onClick={handleMostrarVisitas} className="btn-mostrar-visitas">
                {mostrarVisitas ? 'Ocultar Visitas' : 'Ver Visitas Realizadas'}
            </button>

            {mostrarVisitas && (
                <div className="visitas-section">
                    <h2>Visitas Realizadas</h2>
                    
                    {isLoadingVisitas && (
                        <div className="loading-visitas">
                            <div className="spinner"></div>
                            <p>Cargando visitas...</p>
                        </div>
                    )}
                    
                    {error && (
                        <div className="error-visitas">
                            <p>{error}</p>
                            <button onClick={cargarVisitas} className="btn-reintentar">
                                Reintentar
                            </button>
                        </div>
                    )}
                    
                    {!isLoadingVisitas && !error && visitas.length === 0 && (
                        <div className="no-visitas">
                            <div className="no-visitas-icon">📋</div>
                            <h3>No hay visitas registradas</h3>
                            <p>Aún no se han realizado visitas para este expediente.</p>
                        </div>
                    )}
                    
                    {!isLoadingVisitas && !error && visitas.length > 0 && (
                        <div className="visitas-grid">
                            {visitas.map((visita) => (
                                <div key={visita.id} className="visita-card">
                                    <div className="visita-header">
                                        <h3>Visita Realizada</h3>
                                        <span className="visita-id">#{visita.id}</span>
                                    </div>
                                    
                                    <div className="visita-content">
                                        <div className="visita-fecha">
                                            <span className="fecha-icon">📅</span>
                                            <div>
                                                <strong>Fecha de Visita:</strong>
                                                <p>{formatearFecha(visita.fechaVisita || visita.created_at)}</p>
                                            </div>
                                        </div>
                                        
                                        {visita.institucion && (
                                            <div className="visita-detalle">
                                                <span className="institucion-icon">🏢</span>
                                                <div>
                                                    <strong>Institución:</strong>
                                                    <p>{visita.institucion}</p>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {visita.comentario && (
                                            <div className="visita-comentario">
                                                <span className="comentario-icon">💬</span>
                                                <div>
                                                    <strong>Comentario:</strong>
                                                    <p>{visita.comentario.length > 100 ? 
                                                        `${visita.comentario.substring(0, 100)}...` : 
                                                        visita.comentario
                                                    }</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="visita-footer">
                                        <span className="visita-status">✅ Completada</span>
                                        <div className="visita-actions">
                                            <span className="visita-time">
                                                {visita.fechaVisita ? 
                                                    new Date(visita.fechaVisita).toLocaleDateString() : 
                                                    'Sin fecha específica'
                                                }
                                            </span>
                                            <button 
                                                onClick={() => handleVerVisita(visita.id)}
                                                className="btn-ver-visita"
                                            >
                                                Ver Visita
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default CardsVisita;