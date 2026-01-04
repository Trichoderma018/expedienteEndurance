import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const RutasPrivadas = ({ element }) => {
  const navigate = useNavigate();
  const [debeRedirigir, setDebeRedirigir] = useState(false);

  // const token = GetCookie.getCookie("access_token");
  const token = localStorage.getItem('usuarioActual');
  const estaAutenticado = Boolean(token);

  const mostrarAlertaDeAccesoDenegado = () => {
    Swal.fire({
      icon: 'error',
      title: 'Acceso denegado',
      text: 'Necesitas iniciar sesión para acceder a esta página.',
      background: '#1a1a1a',
      color: '#ffffff',
      showConfirmButton: false,
      timer: 2500,
    }).then(() => setDebeRedirigir(true));
  };

  useEffect(() => {
    if (!estaAutenticado && !debeRedirigir) {
      mostrarAlertaDeAccesoDenegado();
    }
  }, [estaAutenticado, debeRedirigir]);

  useEffect(() => {
    if (debeRedirigir) {
      navigate('/login');
    }
  }, [debeRedirigir, navigate]);

  return estaAutenticado ? element : null;
};

export default RutasPrivadas;
