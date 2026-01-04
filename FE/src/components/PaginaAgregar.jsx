import React, { useState, useEffect, useRef } from 'react';
import Llamados from '../services/Llamados';
import '../style/inputspeed.css'; 



import { useNavigate } from 'react-router-dom';

function PaginaAgregar() {
    const [userExpediente, setUserExpediente] = useState('');
    const [rolExpediente, setRolExpediente] = useState('');
    const fileInputRef = useRef(null);
    const [imagenExpediente, setImagenExpediente] = useState('');
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
                
                // Limpiar localStorage después de cargar
                localStorage.removeItem('modoEdicion');
                localStorage.removeItem('expedienteEditar');
            } catch (error) {
                console.error('Error al parsear expediente para edición:', error);
            }
        }
    }, []);

    // Nueva función para cargar datos cuando viene del View
    function cargarDatosParaEdicion(expediente) {
        setUserExpediente(expediente.user || '');
        setRolExpediente(expediente.rol || '');
        setActivoExpediente(expediente.activo ? 'activo' : 'inactivo');
        setImagenExpediente(expediente.imagen || '');
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
            const response = await Llamados.getData('api/expedientes/');
            setExpedientes(response.data || response);
        } catch (error) {
            console.error('Error obteniendo expedientes:', error);
        }
    }

    async function obtenerUsuarios() {
        try {
            const response = await Llamados.getData('api/users/');
            setUsuarios(response.data || response);
        } catch (error) {
            console.error('Error obteniendo usuarios:', error);
        }
    }

    function obtenerNombreUsuario(userId) {
        const usuario = usuarios.find(user => user.id === userId);
        return usuario ? usuario.name || usuario.username || usuario.nombre : 'Usuario no encontrado';
    }

    const handleImageChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                const result = await uploadImageToS3(file);
                const imagenUrl = result.Location;
                setImagenExpediente(imagenUrl);
            } catch (error) {
                console.error('Error al subir la imagen a S3:', error);
                setError('No se pudo subir la imagen a S3');
            }
        }
    };

    async function cargarDatos() {
        const obj = {
            user: userExpediente,
            rol: rolExpediente,
            activo: activoExpediente === 'activo',
            imagen: imagenExpediente,
            genero: generoExpediente,
            sede: sedeExpediente,
            comentario1: comentario1Expediente,
            comentario2: comentario2Expediente,
            comentario3: comentario3Expediente,
            fecha: fechaExpediente
        };

        try {
            const response = await Llamados.postData(obj, 'api/expedientes/');
            limpiarFormulario();
            obtenerExpedientes();
            // Navegar a la página de expedientes después de crear exitosamente
            navigate('/expediente');
            return response;
        } catch (error) {
            console.error('Error al crear expediente:', error);
            throw error;
        }
    }

    async function actualizarExpediente() {
        const expedienteActualizado = {
            user: userExpediente,
            rol: rolExpediente,
            activo: activoExpediente === 'activo',
            imagen: imagenExpediente,
            genero: generoExpediente,
            sede: sedeExpediente,
            comentario1: comentario1Expediente,
            comentario2: comentario2Expediente,
            comentario3: comentario3Expediente,
            fecha: fechaExpediente
        };

        try {
            await Llamados.patchData(expedienteActualizado, 'api/expedientes', currentExpedienteId);
            
            // Guardar el ID antes de limpiar el formulario
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
            setError('Error al actualizar expediente');
        }
    }

    async function eliminarExpediente(id) {
        if (window.confirm('¿Está seguro que desea eliminar este expediente?')) {
            try {
                await Llamados.deleteData('api/expedientes', id);
                obtenerExpedientes();
            } catch (error) {
                console.error('Error al eliminar expediente:', error);
                setError('Error al eliminar expediente');
            }
        }
    }

    function editarExpediente(expediente) {
        setUserExpediente(expediente.user || '');
        setRolExpediente(expediente.rol || '');
        setActivoExpediente(expediente.activo ? 'activo' : 'inactivo');
        setImagenExpediente(expediente.imagen || '');
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
        setRolExpediente('');
        setImagenExpediente('');
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

        if (!userExpediente || !sedeExpediente || !generoExpediente || !activoExpediente || !fechaExpediente) {
            setError('Por favor, complete todos los campos obligatorios.');
            setIsLoading(false);
            return;
        }

        if (!fechaExpediente.match(/^\d{4}-\d{2}-\d{2}$/)) {
            setError('Por favor, seleccione una fecha válida.');
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
        <div className='visita-container'>
            <div className='header-inner'>
                <header className='Endurance'>
                    <img src="./assets/img/Logo-Endurance.jpg" alt="Logo Endurance" className="logo" />
                    <h1>ENDURANCE</h1>
                    

                </header>
            </div>

            <div className="crf">
                <h2>{editMode ? 'EDITAR EXPEDIENTE' : 'EXPEDIENTES'}</h2>
                <form onSubmit={handleSubmit}>
                    <select className='inyou' value={userExpediente} onChange={e => setUserExpediente(e.target.value)} required>
                        <option value="">Name</option>
                        {usuarios.map(usuario => (
                            <option key={usuario.id} value={usuario.id}>
                                {usuario.name || usuario.username || usuario.nombre}
                            </option>
                        ))}
                    </select>

                    <select className='inyou' value={rolExpediente} onChange={e => setRolExpediente(e.target.value)} required>
                        <option value="">Rol</option>
                        <option value="atleta">Atleta</option>
                        <option value="entrenador">Entrenador</option>
                        <option value="staff">STAFF</option>
                    </select>

                    <div className="campo">
                        <label htmlFor="imagen">Imagen del Expediente</label> <br />
                        <input
                            className='inyou'
                            id="imagen"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            ref={fileInputRef}
                        />
                        {imagenExpediente && (
                            <div style={{marginTop: '10px'}}>
                                <img src={imagenExpediente}  />
                            </div>
                        )}
                    </div>

                    <select className='inyou' value={activoExpediente} onChange={e => setActivoExpediente(e.target.value)} required>
                        <option value="">Estado</option>
                        <option value="inactivo">Inactivo</option>
                        <option value="activo">Activo</option>
                    </select>

                    <select className='inyou' value={generoExpediente} onChange={e => setGeneroExpediente(e.target.value)} required>
                        <option value="">Género</option>
                        <option value="masculino">Masculino</option>
                        <option value="femenino">Femenino</option>
                        <option value="otro">Otro</option>
                    </select>

                    <select className='inyou' value={sedeExpediente} onChange={e => setSedeExpediente(e.target.value)} required>
                        <option value="">Sede</option>
                        <option value="San José">San José</option>
                        <option value="Limón">Limón</option>
                        <option value="Cartago">Cartago</option>
                        <option value="Heredia">Heredia</option>
                        <option value="Alajuela">Alajuela</option>
                        <option value="Guanacaste">Guanacaste</option>
                        <option value="Puntarenas">Puntarenas</option>
                    </select>

                    <input className='inyou' type="text" value={comentario1Expediente} onChange={e => setComentario1Expediente(e.target.value)} placeholder="Comentario °1" />
                    <input className='inyou' type="text" value={comentario2Expediente} onChange={e => setComentario2Expediente(e.target.value)} placeholder="Comentario °2" />
                    <input className='inyou' type="text" value={comentario3Expediente} onChange={e => setComentario3Expediente(e.target.value)} placeholder="Comentario °3" />

                    <input 
                        className='inyou' 
                        type="date" 
                        value={fechaExpediente} 
                        onChange={e => setFechaExpediente(e.target.value)} 
                        required 
                    />

                    <div style={{ marginTop: '10px' }}>
                        <button className='button' type="submit" disabled={isLoading}>
                            {isLoading ? 'Procesando...' : (editMode ? 'Actualizar' : 'Agregar')}
                        </button>
                            <button className='button' onClick={() => navigate(-1)}>
                             ⬅️ Regresar
                            </button>
                        {editMode && (
                            <button 
                                type="button" 
                                onClick={() => {
                                    limpiarFormulario();
                                    navigate('/views'); // Volver al view si cancela edición
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
             {/* registro del expediente */}
            <div className="">
                <table>
                    <thead>
                        <tr>
                            <th className='inyou'>Usuario</th>
                            <th className='inyou'>Rol</th>
                            <th className='inyou'>Estado</th>
                            <th className='inyou'>Género</th>
                            <th className='inyou'>Sede</th>
                            <th className='inyou'>Fecha</th>
                            <th className='inyou'>Acciones</th>
                        </tr>
                    </thead>
                    <tbody className='moverpage'>
                        {expedientes.map(expediente => (
                            <tr key={`exp-${expediente.id}`} className='inyou'>
                                <td>{obtenerNombreUsuario(expediente.user)}</td>
                                <td>{expediente.rol}</td>
                                <td>{expediente.activo ? 'Activo' : 'Inactivo'}</td>
                                <td>{expediente.genero}</td>
                                <td>{expediente.sede}</td>
                                <td>{expediente.fechaExpediente}</td>
                                <td>
                                    <button onClick={() => editarExpediente(expediente)} className='FLR'>Editar</button>
                                    <button onClick={() => eliminarExpediente(expediente.id)} className='FLR'>Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default PaginaAgregar;