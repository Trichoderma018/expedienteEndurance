import React from 'react'
import { Link } from 'react-router-dom'
import '../style/Navbar.css'
import Logo from '../assets/img/Logo-Endurance.jpg'; 

function Navbar() {
  return (
    <div className='Container-NAV'>
        <div className='proyectos-barra'>
            <header className='proyectos-endurance'>ENDURANCE</header>
        </div>
        <nav className='NavBar'>
            <img className="montage" src={Logo} alt="Logo" />
            <div className="cont-rutas">
                <label>
                    <Link to={"/Expediente"}>
                    <input
                    defaultValue="expediente"
                    name="value-radio"
                    id="value-2"
                    type="button"
                    className='lar'
                />
                </Link>
                </label>
                
                <label>
                    <Link to={"/proyectos"}>
                    <input
                    defaultValue="proyecto"
                    name="value-radio"
                    id="value-3"
                    type="button"
                    className='lar'
                />
                </Link>
                </label>
                
                <label>
                    <Link to="/MantAdmin">
                    <input
                    defaultValue="mantenimiento"
                    name="value-radio"
                    id="value-3"
                    type="button"
                    className='lar'
                />
                </Link>
                </label>

                <label>
                    <Link to="/graficas">
                    <input
                    defaultValue="graficas"
                    name="value-radio"
                    id="value-3"
                    type="button"
                    className='lar'
                />
                </Link>
                </label>

            </div>
            <Link to="/null" className="BtnCerrar">
                <i className="fas fa-sign-out-alt"></i>
                Cerrar Sesión
            </Link>
        </nav>
    </div>
  )
}

export default Navbar