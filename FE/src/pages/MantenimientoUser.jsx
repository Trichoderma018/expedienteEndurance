
import Navbar from '../component/Navbar'
import Sidebar from '../component/Sidebar'
import MantUser from '../component/MantUser'

function MantenimientoUser() {
  return (
    <div>
        <Navbar/>
        <div className='AdminMantConteiner'>
          <Sidebar/>
          <MantUser/>
        </div>
    </div>
  )
}

export default MantenimientoUser