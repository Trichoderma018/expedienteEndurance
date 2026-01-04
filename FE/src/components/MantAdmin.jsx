import React, { useEffect } from 'react'
import Llamados from '../services/Llamados'
import "../style/MantAdmin.css"


function MantAdmin() {
  const [nombreCompleto, setNombreCompleto] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [user, setUser] = React.useState('') // Cambiado de password a user
  const [administradores, setAdministradores] = React.useState([])
  const [usuarios, setUsuarios] = React.useState([]) // Para cargar los usuarios disponibles
  const [editMode, setEditMode] = React.useState(false)
  const [currentAdminId, setCurrentAdminId] = React.useState(null)
  function handleNombreCompleto(e) {
    setNombreCompleto(e.target.value)
  }   
  function handleEmail(e) {
    setEmail(e.target.value)
  }
  useEffect(() => {
    obtenerAdministradores()
    obtenerUsuarios() // Cargar usuarios para el select
  }, [])
  async function obtenerAdministradores() {
    try {
        const response = await Llamados.getData('api/admin/')
        console.log("Administradores obtenidos:", response)
        setAdministradores(response.data || response)
    } catch (error) {
        console.error("Error obteniendo administradores:", error)
    }
  }
  async function obtenerUsuarios() {
    try {
        const response = await Llamados.getData('api/users/') // Ajusta la URL según tu API
        console.log("Usuarios obtenidos:", response)
        setUsuarios(response.data || response)
        console.log(response); 
    } catch (error) {
        console.error("Error obteniendo usuarios:", error)
    }
  }
  async function cargarDatos() {
    try {
      const obj = {
        nombreCompleto: nombreCompleto,
        email: email,
        user: user // Asegurar que se envíe como número
      }
      console.log('Objeto a enviar:', obj) // Para debug
      console.log(obj);
      const response = await Llamados.postData(obj, 'api/admin/')
      console.log('Response Data', response)
      limpiarFormulario()
      obtenerAdministradores()
    } catch (error) {
      console.error("Error al crear administrador:", error)
    }
  }
  async function actualizarAdministrador() {
    try {
      const administradorActualizado = {
        nombreCompleto: nombreCompleto,
        email: email,
        user: user
      }
      console.log('Objeto a actualizar:', administradorActualizado) // Para debug
      await Llamados.patchData(administradorActualizado, "api/admin", currentAdminId)
      limpiarFormulario()
      setEditMode(false)
      setCurrentAdminId(null)
      obtenerAdministradores()
    } catch (error) {
      console.error("Error al actualizar administrador:", error)
    }
  }
  async function eliminarAdministrador(id) {
    if (window.confirm("¿Está seguro que desea eliminar este administrador?")) {
      try {
        await Llamados.deleteData("api/admin", id)
        obtenerAdministradores()
      } catch (error) {
        console.error("Error al eliminar administrador:", error)
      }
    }
  }
  function editarAdministrador(administrador) {
    setNombreCompleto(administrador.nombreCompleto)
    setEmail(administrador.email)
    setUser(administrador.user) // Ya viene como número del backend
    setCurrentAdminId(administrador.id)
    setEditMode(true)
  }
  function limpiarFormulario() {
    setNombreCompleto('')
    setEmail('')
    setUser('')
    setEditMode(false)
    setCurrentAdminId(null)
  }
  function handleSubmit() {
    if (editMode) {
        actualizarAdministrador()
    } else {
        cargarDatos()
    }
  }
  // Función para obtener el username del usuario
  function getUsernameById(userId) {
    const usuario = usuarios.find(u => u.id === userId)
    return usuario ? usuario.username : 'Usuario no encontrado'
  }
  return (
    <div className='mant-admin23'>

      {/* <Sidebar/> */}
      <h2>{editMode ? 'Editar Administrador' : 'Crear Administrador'}</h2>
      <div className="formu">
          <div className="formulario-campo">
              <label htmlFor="campo-nombreCompleto"></label>
              <input
                id="nombreCompleto"
                type="text"
                placeholder="Ingrese su nombre "
                value={nombreCompleto}
                onChange={handleNombreCompleto}
                className='input-nombreCompleto1'
              />
          </div>
          <br />
          <div className="formulario-campo">
              <label htmlFor="campo-email" ></label>
              <input
                className='input-email1'
                id="email"
                type="email"
                placeholder="Ingrese su email"
                value={email}
                onChange={handleEmail}
              />
          </div>
          <br />
          <div className="campo-user1">
              <label htmlFor="user"></label>
              <select
                className='input-user'
                id="user"
                value={user}
                onChange={(e)=>setUser(e.target.value)}
              >
                <option key="empty-option" value="">Seleccione un usuario</option>
                {usuarios && usuarios.length > 0 && usuarios.map((usuario, index) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.username}
                  </option>
                ))}
              </select>
          </div>
          <div className="botone-formulario">
              <button   
                onClick={handleSubmit}
                className="bot-submit"

              >
                {editMode ? 'Actualizar' : 'Crear'} 
              </button>
              {editMode && (
                <button 
                  onClick={limpiarFormulario}
                  className="boton-cancelar"
                >
                  Cancelar
                </button>
              )}
          </div>
      </div>
      <br />
      <h2>Lista de Administradores</h2>
      <table className="tabla-administradores">
        <thead>
          <tr className="tabla-titulos">
            <th className='nombre'>Nombre Completo</th>
            <th className='email'>Email</th>
            <th className='usuario'>Usuario</th>
            <th className='acciones'>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {administradores && administradores.length > 0 && administradores.map((administrador, index) => (
            <tr key={`admin-${administrador.id}-${index}`}>
              <td>{administrador.nombreCompleto}</td>
              <td>{administrador.email}</td>
              <td>{getUsernameById(administrador.user)}</td>
              <td>
                <button 
                  onClick={() => editarAdministrador(administrador)}
                  className="boton-edit"
                >
                  Editar
                </button>
                <button 
                  onClick={() => eliminarAdministrador(administrador.id)}
                  className="boton-delete"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
export default MantAdmin