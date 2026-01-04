import React, { useState, useEffect, useRef } from 'react'
import Llamados from '../services/Llamados'

import Navbar from './Navbar'
import '../style/proyectos.css'

function Proyectos() {
    // Estados del formulario
    const [nombreProyecto, setNombreProyecto] = useState("")
    const [usuariosProyecto, setUsuariosProyecto] = useState([])
    const [objetivoProyecto, setObjetivoProyecto] = useState("")
    const [imagenProyecto, setImagenProyecto] = useState("")
    const [descripcionProyecto, setDescripcionProyecto] = useState("")
    const [fechaInicioProyecto, setFechaInicioProyecto] = useState("")
    const [fechaFinProyecto, setFechaFinProyecto] = useState("")
    const [activoProyecto, setActivoProyecto] = useState("")
    const fileInputRef = useRef(null);
    const [proyectos, setProyectos] = useState([])
    const [usuarios, setUsuarios] = useState([])
    const [editMode, setEditMode] = useState(false)
    const [currentProyectoId, setCurrentProyectoId] = useState(null)
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        obtenerProyectos()
        obtenerUsuarios()
    }, [])

    async function obtenerProyectos() {
        try {
            const response = await Llamados.getData('api/proyecto/')
            console.log("Proyectos obtenidos:", response)
            setProyectos(response.data || response)
        } catch (error) {
            console.error("Error obteniendo proyectos:", error)
        }
    }

    async function obtenerUsuarios() {
        try {
            const response = await Llamados.getData('api/users/')
            console.log("Usuarios obtenidos:", response)
            setUsuarios(response.data || response)
        } catch (error) {
            console.error("Error obteniendo usuarios:", error)
        }
    }

    function obtenerNombresUsuarios(usuariosIds) {
        if (!usuariosIds || usuariosIds.length === 0) return 'Sin usuarios asignados'
        const nombres = usuariosIds.map(userId => {
            const usuario = usuarios.find(user => user.id === userId)
            return usuario ? usuario.name || usuario.username || usuario.nombre : 'Usuario no encontrado'
        })
        return nombres.join(', ')
    }

    const handleImageChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                const result = await uploadImageToS3(file);
                const imagenUrl = result.Location;
                setImagenProyecto(imagenUrl)
            } catch (error) {
                console.error('Error al subir la imagen a S3:', error);
                setError('No se pudo subir la imagen a S3');
            }
        }
    };

    const handleUsuarioChange = (event) => {
        const selectedOptions = Array.from(event.target.selectedOptions, option => parseInt(option.value))
        setUsuariosProyecto(selectedOptions)
    }

    async function cargarDatos() {
        try {
            // 1. Crear el proyecto primero
            const objProyecto = {
                nombreProyecto: nombreProyecto,
                objetivo: objetivoProyecto,
                imagen: imagenProyecto,
                descripcion: descripcionProyecto,
                fechaInicio: fechaInicioProyecto,
                fechaFin: fechaFinProyecto,
                activo: activoProyecto === "activo"
            }
            
            console.log('Objeto proyecto a enviar:', objProyecto)
            const responseProyecto = await Llamados.postData(objProyecto, 'api/proyecto/')
            console.log('Response Proyecto:', responseProyecto)
            
            // 2. Obtener el ID del proyecto creado
            const proyectoId = responseProyecto.id || responseProyecto.data?.id
            
            if (!proyectoId) {
                throw new Error('No se pudo obtener el ID del proyecto creado')
            }
            
            // 3. Crear las relaciones en ProyectoUsuarios para cada usuario seleccionado
            if (usuariosProyecto && usuariosProyecto.length > 0) {
                const promesasUsuarios = usuariosProyecto.map(async (userId) => {
                    const objProyectoUsuario = {
                        proyecto: proyectoId,
                        user: userId
                    }
                    
                    console.log('Creando relación proyecto-usuario:', objProyectoUsuario)
                    return await Llamados.postData(objProyectoUsuario, 'api/proyecto-usuarios/')
                })
                
                // Esperar a que todas las relaciones se creen
                //await Promise.all(promesasUsuarios)
                console.log('Todas las relaciones proyecto-usuario creadas exitosamente')
            }
            
            limpiarFormulario()
            obtenerProyectos()
            
        } catch (error) {
            console.error("Error al crear proyecto y relaciones:", error)
            setError("Error al crear proyecto y asignar usuarios")
        }
    }

    async function actualizarProyecto() {
        try {
            // 1. Actualizar el proyecto
            const proyectoActualizado = {
                nombreProyecto: nombreProyecto,
                objetivo: objetivoProyecto,
                imagen: imagenProyecto,
                descripcion: descripcionProyecto,
                fechaInicio: fechaInicioProyecto,
                fechaFin: fechaFinProyecto,
                activo: activoProyecto === "activo"
            }
            
            console.log('Objeto a actualizar:', proyectoActualizado)
            await Llamados.patchData(proyectoActualizado, "api/proyecto", currentProyectoId)
            
            // 2. Eliminar todas las relaciones existentes del proyecto
            try {
                await Llamados.deleteData(`api/proyecto-usuarios/proyecto/${currentProyectoId}`)
            } catch (error) {
                console.log('No hay relaciones existentes para eliminar o error:', error)
            }
            
            // 3. Crear las nuevas relaciones
            if (usuariosProyecto && usuariosProyecto.length > 0) {
                const promesasUsuarios = usuariosProyecto.map(async (userId) => {
                    const objProyectoUsuario = {
                        proyecto: currentProyectoId,
                        user: userId
                    }
                    
                    console.log('Creando nueva relación proyecto-usuario:', objProyectoUsuario)
                    return await Llamados.postData(objProyectoUsuario, 'api/proyecto-usuarios/')
                })
                
                await Promise.all(promesasUsuarios)
                console.log('Todas las nuevas relaciones proyecto-usuario creadas exitosamente')
            }
            
            limpiarFormulario()
            setEditMode(false)
            setCurrentProyectoId(null)
            obtenerProyectos()
            
        } catch (error) {
            console.error("Error al actualizar proyecto:", error)
            setError("Error al actualizar proyecto y usuarios")
        }
    }

    async function eliminarProyecto(id) {
        if (window.confirm("¿Está seguro que desea eliminar este proyecto?")) {
            try {
                await Llamados.deleteData("api/proyecto", id)
                obtenerProyectos()
            } catch (error) {
                console.error("Error al eliminar proyecto:", error)
                setError("Error al eliminar proyecto")
            }
        }
    }

    function editarProyecto(proyecto) {
        setNombreProyecto(proyecto.nombreProyecto || "")
        setUsuariosProyecto(proyecto.usuarios || [])
        setObjetivoProyecto(proyecto.objetivo || "")
        setImagenProyecto(proyecto.imagen || "")
        setDescripcionProyecto(proyecto.descripcion || "")
        setFechaInicioProyecto(proyecto.fechaInicio || "")
        setFechaFinProyecto(proyecto.fechaFin || "")
        setActivoProyecto(proyecto.activo ? "activo" : "inactivo")
        setCurrentProyectoId(proyecto.id)
        setEditMode(true)
    }

    function limpiarFormulario() {
        setNombreProyecto("")
        setUsuariosProyecto([])
        setObjetivoProyecto("")
        setImagenProyecto("")
        setDescripcionProyecto("")
        setFechaInicioProyecto("")
        setFechaFinProyecto("")
        setActivoProyecto("")
        setEditMode(false)
        setCurrentProyectoId(null)
        setError(null)

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    function handleSubmit(event) {
        event.preventDefault()
        setIsLoading(true)
        setError(null)
        
        if (!nombreProyecto || !objetivoProyecto || !fechaInicioProyecto || !fechaFinProyecto || !activoProyecto) {
            setError('Por favor, complete todos los campos obligatorios.')
            setIsLoading(false)
            return
        }

        if (new Date(fechaFinProyecto) < new Date(fechaInicioProyecto)) {
            setError('La fecha de fin no puede ser anterior a la fecha de inicio.')
            setIsLoading(false)
            return
        }
        
        if (editMode) {
            actualizarProyecto()
        } else {
            cargarDatos()
        }
        setIsLoading(false)
    }

    return (
    <div className='acomodo2'>
        <div className='proyectos-fondo'>

            <Navbar/> 
            
            <div className="proyectos-container">
                <h2 className="proyectos-titulo">{editMode ? 'EDITAR PROYECTO' : 'PROYECTOS'}</h2>
                <form className="proyectos-form" onSubmit={handleSubmit}>
                    <input  value={nombreProyecto} onChange={(e) => setNombreProyecto(e.target.value)} className='proyectos-input' type="text" name="nombreProyecto" placeholder="Nombre del Proyecto" required/>

                    <select className='proyectos-select-multiple' name="usuarios" value={usuariosProyecto} onChange={handleUsuarioChange} multiple size="5">
                        <option value="" disabled>Seleccionar Usuarios (Ctrl+Click para múltiples)</option>
                        {usuarios && usuarios.length > 0 && usuarios.map((usuario) => (
                            <option key={usuario.id} value={usuario.id}>
                                {usuario.name || usuario.username || usuario.nombre}
                            </option>
                        ))}
                    </select>

                    <textarea value={objetivoProyecto} onChange={(e) => setObjetivoProyecto(e.target.value)} className='proyectos-textarea' name="objetivo" placeholder="Objetivo del Proyecto" rows="4" required/>

                    <div className="proyectos-campo-imagen">
                        <label className="proyectos-label" htmlFor="imagen">Imagen del Proyecto</label>
                        <input id="imagen" className="proyectos-file-input" type="file" accept="image/*" onChange={handleImageChange} ref={fileInputRef}/>
                        {imagenProyecto && (
                            <div className="proyectos-preview-container">
                                <img src={imagenProyecto} alt="Preview" className="proyectos-preview-img"/>
                            </div>
                        )}
                    </div>

                    <textarea value={descripcionProyecto} onChange={(e) => setDescripcionProyecto(e.target.value)} className='proyectos-textarea' name="descripcion" placeholder="Descripción del Proyecto" rows="4"/>

                    <label className="proyectos-label">Fecha de Inicio:</label>
                    <input className='proyectos-input' type="date" name="fechaInicio" value={fechaInicioProyecto} onChange={(e) => setFechaInicioProyecto(e.target.value)} required />

                    <label className="proyectos-label">Fecha de Fin:</label>
                    <input className='proyectos-input' type="date" name="fechaFin" value={fechaFinProyecto} onChange={(e) => setFechaFinProyecto(e.target.value)} required />

                    <select className='proyectos-select' value={activoProyecto}  onChange={(e) => setActivoProyecto(e.target.value)} required>
                        <option value="">Estado del Proyecto</option>
                        <option value="inactivo">Inactivo</option>
                        <option value="activo">Activo</option>
                    </select>

                    <div className="proyectos-botones">
                        <button className="proyectos-btn-submit" type="submit" disabled={isLoading}>
                            {editMode ? 'Actualizar Proyecto' : 'Crear Proyecto'}
                        </button>

                        {editMode && (
                            <button className="proyectos-btn-cancelar" type="button" onClick={limpiarFormulario}> Cancelar </button>
                        )}
                    </div>
                    
                    {isLoading && (
                        <div className="proyectos-spinner"> <span></span> <span></span> <span></span> <span></span> <span></span> <span></span>
                        </div>
                    )}
                    {error && <p className="proyectos-error">{error}</p>}
                </form>
            </div>

            <div className="proyectos-container">
                <h3 className="proyectos-subtitulo">Lista de Proyectos</h3>
                <div className="proyectos-tabla-container">
                    <table className="proyectos-tabla">
                        <thead>
                            <tr>
                                <th>Nombre</th> <th>Usuarios</th> <th>Objetivo</th> <th>Fecha Inicio</th> <th>Fecha Fin</th> <th>Estado</th> <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proyectos && proyectos.length > 0 && proyectos.map((proyecto) => (
                                <tr key={`proyecto-${proyecto.id}`}>
                                    <td>{proyecto.nombreProyecto}</td>
                                    <td>{obtenerNombresUsuarios(proyecto.usuarios)}</td>
                                    <td>{proyecto.objetivo?.substring(0, 50)}...</td>
                                    <td>{proyecto.fechaInicio}</td>
                                    <td>{proyecto.fechaFin}</td>
                                    <td>
                                        <span className={`proyectos-estado ${proyecto.activo ? 'proyectos-estado-activo' : 'proyectos-estado-inactivo'}`}>
                                            {proyecto.activo ? "Activo" : "Inactivo"}
                                        </span>
                                    </td>
                                    <td>
                                        <button  className="proyectos-btn-editar"onClick={() => editarProyecto(proyecto)}>Editar</button>
                                        <button className="proyectos-btn-eliminar" onClick={() => eliminarProyecto(proyecto.id)}>Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
     </div>   
    </div>
    )
}

export default Proyectos