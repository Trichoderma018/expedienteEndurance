import React from 'react'
import MantAdmin from '../component/MantAdmin'
import Navbar from '../component/Navbar'
import Sidebar from '../component/Sidebar'
import "../style/MantAdmin.css"

function MantenimientoAdmin() {
  return (
    <div>
        <Navbar/>
        <div className='AdminMantConteiner'>
          <Sidebar/>
          <MantAdmin/>
        </div>
    </div>
  )
}

export default MantenimientoAdmin