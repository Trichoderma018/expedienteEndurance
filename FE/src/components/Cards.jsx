import React from 'react'
import "../style/Cards.css"
import { useNavigate } from 'react-router-dom'
import PersonIcon from '@mui/icons-material/Person';

function Cards({id, nombre, imagen, descripcion, rol , view}) {
  const navigate = useNavigate();
  const handleView = () => {
    navigate('/views');
    localStorage.setItem('id', id);
  }
  
  return (
  <div className='card-container'>
    <div className="card">
      {imagen != "" ? <img className="image" src={imagen} alt={PersonIcon} /> : <PersonIcon className="image" style={{ fontSize: 100 }} />}
        <p>{nombre}</p>
        <p className="card-info">{rol}</p>
      <div className="card-description">
        <p>{descripcion}</p>
      </div>
      <div className="card-info">
        
      </div>
      <button onClick={handleView} className="button">
        view
      </button>
 </div>


</div>
  )
}

export default Cards