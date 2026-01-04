import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Loader2 } from 'lucide-react';
import Llamados from '../services/Llamados';
import Logo from '../assets/img/Logo.jpeg';
import '../style/ResetPassword.css';

const ResetPassword = ({ onClose }) => {
  const navigate = useNavigate();
  const [requestStatus, setRequestStatus] = useState({
    success: false,
    error: '',
  });
  const [formData, setFormData] = useState({
    email: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const { email } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const resetPassword = async () => {
    setIsLoading(true);
    setRequestStatus({ success: false, error: '' });

    try {
      await Llamados.postData({ email }, 'api/reset_password/');
      setRequestStatus({ success: true, error: '' });
    } catch (err) {
      console.error('Error during password reset:', err);
      setRequestStatus({ success: false, error: 'Correo electrónico no encontrado en la base de datos.' });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    await resetPassword();
    if (requestStatus.success) {
      setTimeout(() => {
        onClose(); // Cerrar el modal
        navigate('/'); // Redirigir al login
      }, 3000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="login-form"
    >
      <img src={Logo} alt="Logo" className="logo" />
      <AnimatePresence mode="wait">
        {requestStatus.success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, ease: 'easeInOut' }}
              className="inline-block"
            >
              <Mail className="w-12 h-12 text-[#0197A6]" />
            </motion.div>
            <h2 className="form-heading">¡Correo enviado!</h2>
            <p className="text-[#333]">
              Revisa tu correo electrónico para obtener instrucciones sobre cómo restablecer tu contraseña. Serás redirigido al login en breve.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div>
              <h1 className="form-heading">Restablecer Contraseña</h1>
              <p className="text-[#333] mt-2">
                Ingresa tu correo electrónico para recibir un enlace de restablecimiento.
              </p>
            </div>

            {requestStatus.error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="error-message"
              >
                {requestStatus.error}
              </motion.p>
            )}

            <div className="input-group">
              <input
                type="email"
                name="email"
                value={email}
                onChange={onChange}
                placeholder="Correo electrónico"
                required
                className="w-full"
              />
              <label htmlFor="email">Correo Electrónico</label>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="submit_rst"
              onClick={onSubmit}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <span>Enviar Enlace</span>
              )}
            </motion.button>

            <div className="signup-link">
              ¿Ya tienes una cuenta?{' '}
              <a href="#" onClick={() => navigate('/')}>Iniciar Sesión</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};


export default ResetPassword;