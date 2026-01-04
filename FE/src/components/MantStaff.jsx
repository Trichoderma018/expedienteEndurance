import React, { useEffect } from 'react'
import Llamados from '../services/Llamados'
import Sidebar from './Sidebar'
import '../style/MantStaff.css'
function MantStaff() {
    const [nombreCompleto, setNombreCompleto] = React.useState('')
    const [email, setEmail] = React.useState('')
    const [cargo, setCargo] = React.useState('')
    const [activo, setActivo] = React.useState(true)
    const [departamento, setDepartamento] = React.useState('')
    const [user, setUser] = React.useState('') // Agregado para seleccionar usuario
    const [staff, setStaff] = React.useState([])
    const [usuarios, setUsuarios] = React.useState([]) // Para cargar los usuarios disponibles
    const [editMode, setEditMode] = React.useState(false)
    const [currentStaffId, setCurrentStaffId] = React.useState(null)
    function handleNombreCompleto(e) {
        setNombreCompleto(e.target.value)
    }   
    function handleEmail(e) {
        setEmail(e.target.value)
    }
    function handleCargo(e) {
        setCargo(e.target.value)
    }
    function handleActivo(e) {
        setActivo(e.target.checked)
    }
    function handleDepartamento(e) {
        setDepartamento(e.target.value)
    }
    useEffect(() => {
        obtenerStaff()
        obtenerUsuarios() // Cargar usuarios para el select
    }, [])
    async function obtenerStaff() {
        try {
            const response = await Llamados.getData('api/staff/')
            console.log("Staff obtenido:", response)
            setStaff(response.data || response)
        } catch (error) {
            console.error("Error obteniendo staff:", error)
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
    async function crearStaff() {
        try {
            const obj = {
                nombreCompleto: nombreCompleto,
                email: email,
                cargo: cargo,
                activo: activo,
                departamento: departamento,
                user: user // Incluir el usuario seleccionado
            }
            console.log('Objeto a enviar:', obj) // Para debug
            const response = await Llamados.postData(obj, 'api/staff/')
            console.log('Response Data', response)
            limpiarFormulario()
            obtenerStaff()
        } catch (error) {
            console.error("Error al crear staff:", error)
        }
    }
    async function actualizarStaff() {
        try {
            const staffActualizado = {
                nombreCompleto: nombreCompleto,
                email: email,
                cargo: cargo,
                activo: activo,
                departamento: departamento,
                user: user // Incluir el usuario seleccionado
            } 
            console.log('Objeto a actualizar:', staffActualizado) // Para debug
            await Llamados.patchData(staffActualizado, "api/staff", currentStaffId)
            limpiarFormulario()
            setEditMode(false)
            setCurrentStaffId(null)
            obtenerStaff()
        } catch (error) {
            console.error("Error al actualizar staff:", error)
        }
    }
    async function eliminarStaff(id) {
        if (window.confirm("¿Está seguro que desea eliminar este miembro del staff?")) {
            try {
                await Llamados.deleteData("api/staff", id)
                obtenerStaff()
            } catch (error) {
                console.error("Error al eliminar staff:", error)
            }
        }
    }
    function editarStaff(staff) {
        setNombreCompleto(staff.nombreCompleto)
        setEmail(staff.email)
        setCargo(staff.cargo)
        setActivo(staff.activo)
        setDepartamento(staff.departamento)
        setUser(staff.user) // Cargar el usuario asociado
        setCurrentStaffId(staff.id)
        setEditMode(true)
    }
    function limpiarFormulario() {
        setNombreCompleto('')
        setEmail('')
        setCargo('')
        setActivo(true)
        setDepartamento('')
        setUser('') // Limpiar selección de usuario
        setEditMode(false)
        setCurrentStaffId(null)
    }
    function handleSubmit() {
        if (editMode) {
            actualizarStaff()
        } else {
            crearStaff()
        }
    }
    // Función para obtener el username del usuario
    function getUsernameById(userId) {
        const usuario = usuarios.find(u => u.id === userId)
        return usuario ? usuario.username : 'Usuario no encontrado'
    }
    return (
        <div className='mant-admin23'>
            <h2>{editMode ? 'Editar Staff' : 'Crear Staff'}</h2>
            <div className="formu">
                <div className="campo-nombre">
                    <label htmlFor="nombreCompleto"></label>
                    <input
                        id="nombreCompleto"
                        type="text"
                        value={nombreCompleto}
                        onChange={handleNombreCompleto}
                        placeholder="Nombre Completo"
                        maxLength={150}
                        className="input-nombreCompleto1"
                    />
                </div>
                <br />
                <div className="campo-email">
                    <label htmlFor="email"></label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={handleEmail}
                        placeholder="Email"
                        className="input-email1"
                    />
                </div>
                <br />
                <div className="campo-cargo">
                    <label htmlFor="cargo"></label>
                    <input
                        id="cargo"
                        type="text"
                        value={cargo}
                        onChange={handleCargo}
                        placeholder="Cargo"
                        maxLength={30}
                        className="input-cargo1"
                    />
                </div>
                <br />
                <div className="campo-departamento">
                    <label htmlFor="departamento"></label>
                    <input
                        id="departamento"
                        type="text"
                        value={departamento}
                        onChange={handleDepartamento}
                        placeholder="Departamento"
                        maxLength={30}
                        className="input-departamento1"
                    />
                </div>
                <div className="campo-user1">
                    <label htmlFor="user"></label>
                    <select
                        id="user"
                        value={user}
                        onChange={(e) => setUser(e.target.value)}
                    >
                        <option key="empty-option" value="">Seleccione un usuario</option>
                        {usuarios && usuarios.length > 0 && usuarios.map((usuario, index) => (
                            <option key={usuario.id} value={usuario.id}>
                                {usuario.username}
                            </option>
                        ))}
                    </select>
                </div>
                <br />

                <div className="campo-activo">
                    <label htmlFor="activo">
                        <input
                            id="activo"
                            type="checkbox"
                            checked={activo}
                            onChange={handleActivo}
                        />
                        Staff Activo
                    </label>
                </div>
                <div className="botone-formulario">
                    <button 
                        onClick={handleSubmit}
                        className="bot-submit"
                    >
                        {editMode ? 'Actualizar' : 'Crear'} Staff
                    </button>
                    {editMode && (
                        <button 
                            onClick={limpiarFormulario}
                            className="bot-secondary"
                        >
                            Cancelar
                        </button>
                    )}
                </div>
            </div>
            <br />
            <h2>Lista de Staff</h2>
            <table className="tabla-staff">
                <thead>
                    <tr>
                        <th>Nombre Completo</th>
                        <th>Email</th>
                        <th>Cargo</th>
                        <th>Departamento</th>
                        <th>Usuario</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {staff && staff.length > 0 && staff.map((miembro, index) => (
                        <tr key={`staff-${miembro.id}-${index}`}>
                            <td>{miembro.nombreCompleto}</td>
                            <td>{miembro.email}</td>
                            <td>{miembro.cargo}</td>
                            <td>{miembro.departamento}</td>
                            <td>{getUsernameById(miembro.user)}</td>
                            <td>
                                <span 
                                    style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        color: miembro.activo ? 'green' : 'red',
                                        backgroundColor: miembro.activo ? '#e8f5e8' : '#ffeaea'
                                    }}
                                >
                                    {miembro.activo ? 'ACTIVO' : 'INACTIVO'}
                                </span>
                            </td>
                            <td>
                                <button 
                                    onClick={() => editarStaff(miembro)}
                                    className="boto-edit"
                                >
                                    Editar
                                </button>
                                <button 
                                    onClick={() => eliminarStaff(miembro.id)}
                                    className="boto-delete"
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
export default MantStaff