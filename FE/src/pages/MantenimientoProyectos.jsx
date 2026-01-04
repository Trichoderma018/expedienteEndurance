import React from 'react'
import Navbar from '../component/Navbar'
import Sidebar from '../component/Sidebar'
import MantProyectos from '../component/MantProyectos'

function MantenimientoProyectos() {
  return (
    <div>
        <Navbar/>
        <div className='AdminMantConteiner'>
          <Sidebar/>
          <MantProyectos/>
        </div>
    </div>
    
  )
}

export default MantenimientoProyectos