import React, { useState, useEffect, useRef } from 'react';
import apiService from '../services/apiService';
import { mapExpedienteFromBackend, mapExpedienteToBackend, mapUsuarioFromBackend } from '../services/dataMapper';
import { crearFormDataConArchivo, validarArchivo, previsualizarImagen, obtenerUrlImagen } from '../utils/fileUpload';
import { useNavigate } from 'react-router-dom';
import '../style/inputspeed.css'; 

{/* Editado */}

function AgregarExpediente() {
    const [userExpediente, setUserExpediente] = useState('');
    const [imagenExpediente, setImagenExpediente] = useState('');
    const [imagenFile, setImagenFile] = useState(null);
    const [imagenPreview, setImagenPreview] = useState('');
    const [activoExpediente, setActivoExpediente] = useState('');
    const [generoExpediente, setGeneroExpediente] = useState('');
    const [sedeExpediente, setSedeExpediente] = useState('');
    const [comentario1Expediente, setComentario1Expediente] = useState('');
    const [comentario2Expediente, setComentario2Expediente] = useState('');
    const [comentario3Expediente, setComentario3Expediente] = useState('');
    const [fechaExpediente, setFechaExpediente] = useState('');
    const [expedientes, setExpedientes] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [currentExpedienteId, setCurrentExpedienteId] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    
    useEffect(() => {
        obtenerExpedientes();
        obtenerUsuarios();
        
        // Verificar si viene del componente View en modo edición
        const modoEdicion = localStorage.getItem('modoEdicion');
        const expedienteEditar = localStorage.getItem('expedienteEditar');
        
        if (modoEdicion === 'true' && expedienteEditar) {
            try {
                const expediente = JSON.parse(expedienteEditar);
                cargarDatosParaEdicion(expediente);
                
                localStorage.removeItem('modoEdicion');
                localStorage.removeItem('expedienteEditar');
            } catch (error) {
                console.error('Error al parsear expediente para edición:', error);
            }
        }
    }, []);

    function cargarDatosParaEdicion(expediente) {
        setUserExpediente(expediente.user || '');
        setActivoExpediente(expediente.activo ? 'activo' : 'inactivo');
        setImagenExpediente(expediente.imagen || '');
        setImagenPreview(obtenerUrlImagen(expediente.imagen));
        setGeneroExpediente(expediente.genero || '');
        setSedeExpediente(expediente.sede || '');
        setComentario1Expediente(expediente.comentario1 || '');
        setComentario2Expediente(expediente.comentario2 || '');
        setComentario3Expediente(expediente.comentario3 || '');
        setFechaExpediente(expediente.fechaExpediente || '');
        setCurrentExpedienteId(expediente.id);
        setEditMode(true);
    }

    async function obtenerExpedientes() {
        try {
            const data = await apiService.getData('expedientes/');
            // Mapear expedientes del backend al frontend
            const expedientesMapeados = data.map(mapExpedienteFromBackend);
            setExpedientes(expedientesMapeados);
        } catch (error) {
            console.error('Error obteniendo expedientes:', error);
            setError('Error al cargar expedientes');
        }
    }

    async function obtenerUsuarios() {
        try {
            const data = await apiService.getData('usuarios/');
            // Mapear usuarios del backend al frontend
            const usuariosMapeados = data.map(mapUsuarioFromBackend);
            setUsuarios(usuariosMapeados);
        } catch (error) {
            console.error('Error obteniendo usuarios:', error);
            setError('Error al cargar usuarios');
        }
    }

    function obtenerNombreUsuario(userId) {
        const usuario = usuarios.find(user => user.id === userId);
        return usuario ? usuario.name || usuario.username : 'Usuario no encontrado';
    }

    const handleImageChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            // Validar imagen
            validarArchivo(file, {
                maxSize: 5 * 1024 * 1024, // 5MB
                allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp']
            });

            // Crear preview
            const preview = await previsualizarImagen(file);
            setImagenPreview(preview);
            setImagenFile(file);
            
        } catch (error) {
            console.error('Error al procesar imagen:', error);
            setError(error.message);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    async function cargarDatos() {
        try {
            // Preparar datos básicos del expediente
            const expedienteData = mapExpedienteToBackend({
                user: userExpediente,
                activo: activoExpediente,
                genero: generoExpediente,
                comentario1: comentario1Expediente,
                comentario2: comentario2Expediente,
                comentario3: comentario3Expediente,
            });

            let response;

            // Si hay imagen nueva, usar FormData
            if (imagenFile) {
                const formData = crearFormDataConArchivo(imagenFile, expedienteData);
                response = await apiService.postFormData(formData, 'expedientes/');
            } else {
                // Sin imagen, enviar JSON normal
                response = await apiService.postData(expedienteData, 'expedientes/');
            }

            console.log('Expediente creado:', response);
            
            limpiarFormulario();
            obtenerExpedientes();
            navigate('/expediente');
            
            return response;
        } catch (error) {
            console.error('Error al crear expediente:', error);
            setError(error.response?.data?.message || 'Error al crear expediente');
            throw error;
        }
    }

    async function actualizarExpediente() {
        try {
            const expedienteData = mapExpedienteToBackend({
                user: userExpediente,
                activo: activoExpediente,
                genero: generoExpediente,
                comentario1: comentario1Expediente,
                comentario2: comentario2Expediente,
                comentario3: comentario3Expediente,
            });

            let response;

            // Si hay imagen nueva, usar FormData
            if (imagenFile) {
                const formData = crearFormDataConArchivo(imagenFile, expedienteData);
                response = await apiService.patchFormData(formData, 'expedientes', currentExpedienteId);
            } else {
                // Sin cambio de imagen, enviar JSON normal
                response = await apiService.patchData(expedienteData, 'expedientes', currentExpedienteId);
            }

            console.log('Expediente actualizado:', response);
            
            const expedienteId = currentExpedienteId;
            
            limpiarFormulario();
            setEditMode(false);
            setCurrentExpedienteId(null);
            obtenerExpedientes();
            
            // Navegar de vuelta al view del expediente editado
            localStorage.setItem('id', expedienteId);
            navigate('/views');
            
        } catch (error) {
            console.error('Error al actualizar expediente:', error);
            setError(error.response?.data?.message || 'Error al actualizar expediente');
        }
    }

    async function eliminarExpediente(id) {
        if (window.confirm('¿Está seguro que desea eliminar este expediente?')) {
            try {
                await apiService.deleteData('expedientes', id);
                obtenerExpedientes();
            } catch (error) {
                console.error('Error al eliminar expediente:', error);
                setError('Error al eliminar expediente');
            }
        }
    }

    function editarExpediente(expediente) {
        setUserExpediente(expediente.user || '');
        setActivoExpediente(expediente.activo ? 'activo' : 'inactivo');
        setImagenExpediente(expediente.imagen || '');
        setImagenPreview(obtenerUrlImagen(expediente.imagen));
        setGeneroExpediente(expediente.genero || '');
        setSedeExpediente(expediente.sede || '');
        setComentario1Expediente(expediente.comentario1 || '');
        setComentario2Expediente(expediente.comentario2 || '');
        setComentario3Expediente(expediente.comentario3 || '');
        setFechaExpediente(expediente.fechaExpediente || '');
        setCurrentExpedienteId(expediente.id);
        setEditMode(true);
    }

    function limpiarFormulario() {
        setUserExpediente('');
        setImagenExpediente('');
        setImagenFile(null);
        setImagenPreview('');
        setActivoExpediente('');
        setGeneroExpediente('');
        setSedeExpediente('');
        setComentario1Expediente('');
        setComentario2Expediente('');
        setComentario3Expediente('');
        setFechaExpediente('');
        setEditMode(false);
        setCurrentExpedienteId(null);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        if (!userExpediente || !sedeExpediente || !generoExpediente || !activoExpediente) {
            setError('Por favor, complete todos los campos obligatorios.');
            setIsLoading(false);
            return;
        }

        try {
            if (editMode) {
                await actualizarExpediente();
            } else {
                await cargarDatos();
            }
        } catch (error) {
            setError('Error en el envío del formulario: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className='proyectos-container'>
            <div className='proyectos-tabla-container'>
                <br />  
                <h2>{editMode ? 'EDITAR EXPEDIENTE' : 'EXPEDIENTES'}</h2>
                <form onSubmit={handleSubmit}>
                    <select 
                        className='selectsEx' 
                        value={userExpediente} 
                        onChange={e => setUserExpediente(e.target.value)} 
                        required
                    >
                        <option value="">Seleccionar Usuario</option>
                        {usuarios.map(usuario => (
                            <option key={usuario.id} value={usuario.id}>
                                {usuario.name || usuario.username}
                            </option>
                        ))}
                    </select>

                    <div className="campo">
                        <label htmlFor="imagen">Imagen del Expediente</label>
                        <br />
                        <input
                            className='selectsEx'
                            id="imagen"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            ref={fileInputRef}
                        />
                        {imagenPreview && (
                            <div style={{marginTop: '10px'}}>
                                <img 
                                    src={imagenPreview} 
                                    alt="Preview" 
                                    style={{maxWidth: '200px', maxHeight: '200px'}}
                                />
                            </div>
                        )}
                    </div>

                    <select 
                        className='selectsEx' 
                        value={activoExpediente} 
                        onChange={e => setActivoExpediente(e.target.value)} 
                        required
                    >
                        <option value="">Estado</option>
                        <option value="inactivo">Inactivo</option>
                        <option value="activo">Activo</option>
                    </select>

                    <select 
                        className='selectsEx' 
                        value={generoExpediente} 
                        onChange={e => setGeneroExpediente(e.target.value)} 
                        required
                    >
                        <option value="">Género</option>
                        <option value="masculino">Masculino</option>
                        <option value="femenino">Femenino</option>
                        <option value="otro">Otro</option>
                    </select>

                    <select 
                        className='selectsEx' 
                        value={sedeExpediente} 
                        onChange={e => setSedeExpediente(e.target.value)} 
                        required
                    >
                        <option value="">Sede</option>
                        <option value="San José">San José</option>
                        <option value="Limón">Limón</option>
                        <option value="Cartago">Cartago</option>
                        <option value="Heredia">Heredia</option>
                        <option value="Alajuela">Alajuela</option>
                        <option value="Guanacaste">Guanacaste</option>
                        <option value="Puntarenas">Puntarenas</option>
                    </select>

                    <input 
                        className='selectsEx' 
                        type="text" 
                        value={comentario1Expediente} 
                        onChange={e => setComentario1Expediente(e.target.value)} 
                        placeholder="Comentario General" 
                    />
                    
                    <input 
                        className='selectsEx' 
                        type="text" 
                        value={comentario2Expediente} 
                        onChange={e => setComentario2Expediente(e.target.value)} 
                        placeholder="Comentario Académico" 
                    />
                    
                    <input 
                        className='selectsEx' 
                        type="text" 
                        value={comentario3Expediente} 
                        onChange={e => setComentario3Expediente(e.target.value)} 
                        placeholder="Comentario Económico" 
                    />

                    <div style={{ textAlign: "center", marginTop: '10px' }}>
                        <button className='button' type="submit" disabled={isLoading}>
                            {isLoading ? 'Procesando...' : (editMode ? 'Actualizar' : 'Agregar')}
                        </button>
                        <br />
                      
                        {editMode && (
                            <button 
                                type="button" 
                                onClick={() => {
                                    limpiarFormulario();
                                    navigate('/views');
                                }} 
                                style={{ marginLeft: '10px' }}
                            >
                                Cancelar
                            </button>
                        )}
                    </div>

                    {isLoading && <div className="spinner"><span></span><span></span><span></span></div>}
                    {error && <p className="error">{error}</p>}
                </form>
            </div>

            {/* Registro del expediente */}
            <div>
                <table className='proyectos-tabla-container'>
                    <thead>
                        <tr>
                            <th className='selectsEx'>Usuario</th>
                            <th className='selectsEx'>Estado</th>
                            <th className='selectsEx'>Género</th>
                            <th className='selectsEx'>Sede</th>
                            <th className='selectsEx'>Fecha</th>
                            <th className='selectsEx'>Acciones</th>
                        </tr>
                    </thead>
                    <tbody className='moverpage'>
                        {expedientes.map(expediente => (
                            <tr key={`exp-${expediente.id}`} className='selectsEx'>
                                <td>{obtenerNombreUsuario(expediente.user)}</td>
                                <td>{expediente.activo ? 'Activo' : 'Inactivo'}</td>
                                <td>{expediente.genero}</td>
                                <td>{expediente.sede}</td>
                                <td>{expediente.fechaExpediente}</td>
                                <td style={{display:"flex", justifyContent: "center"}}>
                                    <button onClick={() => editarExpediente(expediente)} className='FLR'>Editar</button>
                                    <button onClick={() => eliminarExpediente(expediente.id)} className='FLRR'>Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AgregarExpediente;