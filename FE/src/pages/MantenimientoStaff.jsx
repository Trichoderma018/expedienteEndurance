import React from 'react'
import Navbar from '../component/Navbar'
import Sidebar from '../component/Sidebar'
import MantStaff from '../component/MantStaff'

function MantenimientoStaff() {


  return (
    <div>
        <Navbar/>
        <div className='AdminMantConteiner'>
          <Sidebar/>
          <MantStaff/>
        </div>
    </div>
  );
}

export default MantenimientoStaff