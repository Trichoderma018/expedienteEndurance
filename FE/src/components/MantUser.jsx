import React, { useEffect } from 'react'
import Llamados from '../services/Llamados'
import Sidebar from './Sidebar'
import '../style/MantUser.css'

function MantUser() {
    const [username, setUsername] = React.useState('')
    const [email, setEmail] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [passwordConfirm, setPasswordConfirm] = React.useState('')
    const [sede, setSede] = React.useState('')
    const [usuarios, setUsuarios] = React.useState([])
    const [editMode, setEditMode] = React.useState(false)
    const [currentUsuarioId, setCurrentUsuarioId] = React.useState(null)
    const [showPassword, setShowPassword] = React.useState(false)
    const [showPasswordConfirm, setShowPasswordConfirm] = React.useState(false)
    const [passwordError, setPasswordError] = React.useState('')
    function handleUsername(e) {
        setUsername(e.target.value)
    }   
    function handleEmail(e) {
        setEmail(e.target.value)
    }
    function handlePassword(e) {
        setPassword(e.target.value)
        validatePasswords(e.target.value, passwordConfirm)
    }
    function handlePasswordConfirm(e) {
        setPasswordConfirm(e.target.value)
        validatePasswords(password, e.target.value)
    }
    function handleSede(e) {
        setSede(e.target.value)
    }
    function validatePasswords(pass, confirmPass) {
        if (pass && confirmPass && pass !== confirmPass) {
            setPasswordError('Las contraseñas no coinciden')
        } else {
            setPasswordError('')
        }
    }
    useEffect(() => {
        obtenerUsuarios()
    }, [])
    async function obtenerUsuarios() {
        try {
            const response = await Llamados.getData('api/users/')
            console.log("Usuarios obtenidos:", response)
            setUsuarios(response.data || response) // Adaptar según la estructura de respuesta
        } catch (error) {
            console.error("Error obteniendo usuarios:", error)
        }
    }
    async function crearUsuario() {
        if (password !== passwordConfirm) {
            setPasswordError('Las contraseñas no coinciden')
            return
        }
        try {
            const obj = {
                username: username,
                email: email,
                password: password,
                password_confirm: passwordConfirm,
                sede: sede
            }
            const response = await Llamados.postData(obj, 'api/users/')
            console.log('Response Data', response)
            limpiarFormulario()
            obtenerUsuarios() // Refrescar la lista
        } catch (error) {
            console.error("Error al crear usuario:", error)
        }
    }
    async function actualizarUsuario() {
        if (password !== passwordConfirm) {
            setPasswordError('Las contraseñas no coinciden')
            return
        }
        console.log("Id usuario:", currentUsuarioId) //debugging
        if (!currentUsuarioId) {
            console.error("No se puede actualizar: ID de usuario no válido")
            return
        }
        try {
            const usuarioActualizado = {
                username: username,
                email: email,
                password: password,
                password_confirm: passwordConfirm,
                sede: sede
            }
            await Llamados.patchData(usuarioActualizado, "api/users",currentUsuarioId)
            limpiarFormulario()
            setEditMode(false)
            setCurrentUsuarioId(null)
            obtenerUsuarios() // Refrescar la lista
        } catch (error) {
            console.error("Error al actualizar usuario:", error)
        }
    }
    async function eliminarUsuario(currentUsuarioId) {
        if (!currentUsuarioId) {
            console.error("No se puede eliminar: ID de usuario no válido")
            return
        }
        if (window.confirm("¿Está seguro que desea eliminar este usuario?")) {
            try {
                await Llamados.deleteData("api/users", currentUsuarioId)
                obtenerUsuarios() // Refresh the list
            } catch (error) {
                console.error("Error al eliminar usuario:", error)
            }
        }
    }
    function editarUsuario(usuario) {
        console.log("Editando usuario:", ) //debugging
        setUsername(usuario.username || '')
        setEmail(usuario.email || '')
        setSede(usuario.sede || '')
        setPassword(usuario.password || '') // Mostrar la contraseña actual
        setPasswordConfirm(usuario.password || '') // Mostrar la contraseña actual
        setPasswordError('')
        setCurrentUsuarioId(usuario.id)
        setEditMode(true)
    }
    // Reset form fields
    function limpiarFormulario() {
        setUsername('')
        setEmail('')
        setPassword('')
        setPasswordConfirm('')
        setSede('')
        setEditMode(false)
        setCurrentUsuarioId(null)
        setShowPassword(false)
        setShowPasswordConfirm(false)
        setPasswordError('')
    }
    // Handle form submission based on mode
    function handleSubmit() {
        if (editMode) {
            actualizarUsuario()
        } else {
            crearUsuario()
        }
    }
    return (
        <div className='mant-admin23'>
            <h2>{editMode ? 'Editar Usuario' : 'Crear Usuario'}</h2>
            <div className="formulario-user">
                <div className="campo-name">
                    <label htmlFor="username"></label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={handleUsername}
                        placeholder="Nombre de Usuario"
                        className="input-name"
                    />
                </div>
                <br />
                <div className="campo-correo">
                    <label htmlFor="email"></label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={handleEmail}
                        placeholder="Email"
                        className="input-correo"
                    />
                </div>
                <br />
                <div className="campo-sede">
                    <label htmlFor="sede"></label>
                    <input
                        id="sede"
                        type="text"
                        value={sede}
                        onChange={handleSede}
                        placeholder="Sede"
                        className="input-sede"
                    />
                </div>
                <br />
                <div className="campo-password">
                    <label htmlFor="password"></label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input
                            className='inp-password'
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={handlePassword}
                            placeholder="Contraseña"
                            style={{ paddingRight: '40px', flex: 1 }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            {showPassword ? '👁️' : '👁️‍🗨️'}
                        </button>
                    </div>
                </div>
                <div className="campo-password-confirm">
                    <label htmlFor="passwordConfirm"></label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input
                            className="inp-password-confirm"
                            id="passwordConfirm"
                            type={showPasswordConfirm ? "text" : "password"}
                            value={passwordConfirm}
                            onChange={handlePasswordConfirm}
                            placeholder="Confirmar Contraseña"
                            style={{ paddingRight: '40px', flex: 1 }}
                        />
                        <button
                        className='button'
                            type="button"
                            onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            {showPasswordConfirm ? '👁️' : '👁️‍🗨️'}
                        </button>
                    </div>
                    {passwordError && (
                        <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
                            {passwordError}
                        </div>
                    )}
                </div>
                <br />
                <div className="botones-formulario">
                    <button 
                        onClick={handleSubmit}
                        className="button-submit"
                        disabled={passwordError !== ''}
                    >
                        {editMode ? 'Actualizar' : 'Crear'} Usuario
                    </button>
                    <br />
                    {editMode && (
                        <button 
                            onClick={limpiarFormulario}
                            className="button-secondary"
                        >
                            Cancelar
                        </button>
                    )}
                </div>
            </div>
            <h2>Lista de Usuarios</h2>
            <table className="tabla-usuarios">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Sede</th>
                        <th>Contraseña</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.map((usuario, index) => (
                        <tr key={usuario.id || `usuario-${index}`}>
                            <td>{usuario.username  || ''}</td>
                            <td>{usuario.email  || ''}</td>
                            <td>{usuario.sede || ''}</td>
                            <td>
                                <span style={{ fontFamily: 'monospace' }}>
                                    {'•'.repeat(usuario.password?.length || 8)}
                                </span>
                            </td>
                            <td>
                                <button 
                                    onClick={() => editarUsuario(usuario)}
                                    className="button-edit"
                                >
                                    Editar
                                </button>
                                <button 
                                    onClick={() => eliminarUsuario(usuario.id)}
                                    className="button-delete"
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
export default MantUser