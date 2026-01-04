import React, { useEffect, useRef } from 'react'
import Llamados from '../services/Llamados'
import "../style/MantProyectos.css"
import Sidebar from './Sidebar'

function MantProyectos() {
  // Estados del formulario
  const [nombreProyecto, setNombreProyecto] = React.useState('')
  const [objetivo, setObjetivo] = React.useState('')
  const [descripcion, setDescripcion] = React.useState('')
  const [imagen, setImagen] = React.useState('')
  const [fechaInicio, setFechaInicio] = React.useState('')
  const [fechaFin, setFechaFin] = React.useState('')
  const [usuarios, setUsuarios] = React.useState([]) // Cambiado a array para múltiples usuarios
  const [activo, setActivo] = React.useState('')
  // Estados de control
  const [proyectos, setProyectos] = React.useState([])
  const [usuariosDisponibles, setUsuariosDisponibles] = React.useState([])
  const [editMode, setEditMode] = React.useState(false)
  const [currentProyectoId, setCurrentProyectoId] = React.useState(null)
  const [error, setError] = React.useState(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const fileInputRef = useRef(null)
  useEffect(() => {
    obtenerProyectos()
    obtenerUsuarios()
  }, [])
  async function obtenerProyectos() {
    try {
      const response = await Llamados.getData('api/proyecto/') // Actualizado endpoint
      console.log("Proyectos obtenidos:", response)
      setProyectos(response.data || response)
    } catch (error) {
      console.error("Error obteniendo proyectos:", error)
      setError("Error al cargar proyectos")
    }
  }
  async function obtenerUsuarios() {
    try {
      const response = await Llamados.getData('api/users/')
      console.log("Usuarios obtenidos:", response)
      setUsuariosDisponibles(response.data || response)
    } catch (error) {
      console.error("Error obteniendo usuarios:", error)
      setError("Error al cargar usuarios")
    }
  }
  const handleImageChange = async (event) => {
    const file = event.target.files[0]
    if (file) {
      try {
        setIsLoading(true)
        const result = await uploadImageToS3(file)
        const imagenUrl = result.Location
        setImagen(imagenUrl)
        setIsLoading(false)
      } catch (error) {
        console.error('Error al subir la imagen a S3:', error)
        setError('No se pudo subir la imagen a S3')
        setIsLoading(false)
      }
    }
  }
  const handleUsuarioChange = (event) => {
    const selectedOptions = Array.from(event.target.selectedOptions, option => parseInt(option.value))
    setUsuarios(selectedOptions)
  }
  function obtenerNombresUsuarios(usuariosIds) {
    if (!usuariosIds || usuariosIds.length === 0) return 'Sin usuarios asignados'
    const nombres = usuariosIds.map(userId => {
      const usuario = usuariosDisponibles.find(user => user.id === userId)
      return usuario ? usuario.name || usuario.username || usuario.nombre : 'Usuario no encontrado'
    })
    return nombres.join(', ')
  }
  async function cargarDatos() {
    try {
      setIsLoading(true)
      setError(null)
      // 1. Crear el proyecto primero
      const objProyecto = {
        nombreProyecto: nombreProyecto,
        objetivo: objetivo,
        imagen: imagen,
        descripcion: descripcion,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
        activo: activo === "activo"
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
      if (usuarios && usuarios.length > 0) {
        const promesasUsuarios = usuarios.map(async (userId) => {
          const objProyectoUsuario = {
            proyecto: proyectoId,
            user: userId
          }
          console.log('Creando relación proyecto-usuario:', objProyectoUsuario)
          return await Llamados.postData(objProyectoUsuario, 'api/proyecto-usuarios/')
        })
        await Promise.all(promesasUsuarios)
        console.log('Todas las relaciones proyecto-usuario creadas exitosamente')
      }
      limpiarFormulario()
      obtenerProyectos()
      setIsLoading(false)
    } catch (error) {
      console.error("Error al crear proyecto y relaciones:", error)
      setError("Error al crear proyecto y asignar usuarios")
      setIsLoading(false)
    }
  }
  async function actualizarProyecto() {
    try {
      setIsLoading(true)
      setError(null)
      // 1. Actualizar el proyecto
      const proyectoActualizado = {
        nombreProyecto: nombreProyecto,
        objetivo: objetivo,
        imagen: imagen,
        descripcion: descripcion,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
        activo: activo === "activo"
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
      if (usuarios && usuarios.length > 0) {
        const promesasUsuarios = usuarios.map(async (userId) => {
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
      setIsLoading(false)
    } catch (error) {
      console.error("Error al actualizar proyecto:", error)
      setError("Error al actualizar proyecto y usuarios")
      setIsLoading(false)
    }
  }
  async function eliminarProyecto(id) {
    if (window.confirm("¿Está seguro que desea eliminar este proyecto?")) {
      try {
        setIsLoading(true)
        await Llamados.deleteData("api/proyecto", id)
        obtenerProyectos()
        setIsLoading(false)
      } catch (error) {
        console.error("Error al eliminar proyecto:", error)
        setError("Error al eliminar proyecto")
        setIsLoading(false)
      }
    }
  }
  function editarProyecto(proyecto) {
    setNombreProyecto(proyecto.nombreProyecto || "")
    setObjetivo(proyecto.objetivo || "")
    setDescripcion(proyecto.descripcion || "")
    setImagen(proyecto.imagen || "")
    setFechaInicio(proyecto.fechaInicio || "")
    setFechaFin(proyecto.fechaFin || "")
    setUsuarios(proyecto.usuarios || [])
    setActivo(proyecto.activo ? "activo" : "inactivo")
    setCurrentProyectoId(proyecto.id)
    setEditMode(true)
  }
  function limpiarFormulario() {
    setNombreProyecto('')
    setObjetivo('')
    setDescripcion('')
    setImagen('')
    setFechaInicio('')
    setFechaFin('')
    setUsuarios([])
    setActivo('')
    setEditMode(false)
    setCurrentProyectoId(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }
  function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    // Validaciones
    if (!nombreProyecto || !objetivo || !fechaInicio || !fechaFin || !activo) {
      setError('Por favor, complete todos los campos obligatorios.')
      return
    }
    if (new Date(fechaFin) < new Date(fechaInicio)) {
      setError('La fecha de fin no puede ser anterior a la fecha de inicio.')
      return
    }
    if (editMode) {
      actualizarProyecto()
    } else {
      cargarDatos()
    }
  }
  return (
    <div className="mant-admin23">
      
      <h2>{editMode ? 'Editar Proyecto' : 'Crear Proyecto'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="formulario-mant-proyectos">
          <div className="campo-formulario">
            <label htmlFor="nombreProyecto"></label>
            <input
              className="inp-nombreProyecto"
              id="nombreProyecto"
              type="text"
              value={nombreProyecto}
              onChange={(e) => setNombreProyecto(e.target.value)}
              placeholder="Nombre del Proyecto"
              required
            />
          </div>
          <div className="campo-formulario">
            <label htmlFor="usuarios">Usuarios Asignados</label>
            <br />
            <select
              className="inp-usuarios"
              id="usuarios"
              value={usuarios}
              onChange={handleUsuarioChange}
              multiple
              size="5"
              style={{height: '120px'}}
            >
              <option value="" disabled>Seleccionar Usuarios (Ctrl+Click para múltiples)</option>
              {usuariosDisponibles && usuariosDisponibles.length > 0 && usuariosDisponibles.map((usuario) => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.name || usuario.username || usuario.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="campo-formulario">
            <label htmlFor="objetivo">Objetivo *</label>
            <br />
            <textarea
              className="inp-objetivo"
              id="objetivo"
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
              placeholder="Objetivo del proyecto"
              rows="4"
              required
            />
          </div>
          <div className="campo-formulario">
            <label htmlFor="imagen">Imagen del Proyecto</label>
            <br />
            <input
              className="inp-imagen"
              id="imagen"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={fileInputRef}
            />
            {imagen && (
              <div style={{marginTop: '10px'}}>
                <img src={imagen} alt="Preview" style={{maxWidth: '200px', maxHeight: '200px'}} />
              </div>
            )}
          </div>
          <div className="campo-formulario">
            <label htmlFor="descripcion">Descripción</label>
            <br />
            <textarea
              className="inp-descripcion"
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción del proyecto"
              rows="4"
            />
          </div>
          <div className="campo-formulario">
            <label htmlFor="fechaInicio">Fecha de Inicio *</label>
            <input
              className='inp-fechaInicio'
              id="fechaInicio"
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              required
            />
          </div>
          <div className="campo-formulario">
            <label htmlFor="fechaFin">Fecha de Fin *</label>
            <input
              className='inp-fechaFin'
              id="fechaFin"
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              required
            />
          </div>
          <div className="campo-formulario">
            <label htmlFor="activo">Estado del Proyecto *</label>
            <select
              id="activo"
              value={activo}
              onChange={(e) => setActivo(e.target.value)}
              required
            >
              <option value="">Seleccione un estado</option>
              <option value="inactivo">Inactivo</option>
              <option value="activo">Activo</option>
            </select>
          </div>
          <div className="botones-formulario">
            <button 
              type="submit"
              className="boto-submit"
              disabled={isLoading}
            >
              {isLoading ? 'Procesando...' : (editMode ? 'Actualizar' : 'Crear') + ' Proyecto'}
            </button>
            {editMode && (
              <button 
                type="button"
                onClick={limpiarFormulario}
                className="boto-secondary"
                disabled={isLoading}
              >
                Cancelar
              </button>
            )}
          </div>
          {error && (
            <div className="error" style={{color: 'red', marginTop: '10px'}}>
              {error}
            </div>
          )}
          <br />
        </div>
        <br />
      </form>
      
      <h2>Lista de Proyectos</h2>
      <table className="tabla-proyectos" style={{width: '100%', borderCollapse: 'collapse'}}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Usuarios</th>
            <th>Objetivo</th>
            <th>Fecha Inicio</th>
            <th>Fecha Fin</th>
            <th>Estado</th>
            <th>Acciones</th>
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
              <td>{proyecto.activo ? "Activo" : "Inactivo"}</td>
              <td>
                <button 
                  onClick={() => editarProyecto(proyecto)}
                  className="boto-edit"
                  disabled={isLoading}
                >
                  Editar
                </button>
                <button 
                  onClick={() => eliminarProyecto(proyecto.id)}
                  className="boto-delete"
                  disabled={isLoading}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isLoading && (
        <div style={{textAlign: 'center', margin: '20px'}}>
          Cargando...
        </div>
      )}
    </div>
  )
}
export default MantProyectos