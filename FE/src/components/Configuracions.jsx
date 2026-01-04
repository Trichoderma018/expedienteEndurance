import React, { useEffect } from 'react';
import Sidebar from './Sidebar'
import '../style/configura.css';

import {
  Button,
  Switch,
  Typography,
  FormControlLabel,
  Box,
  Slider,
  Select,
  MenuItem,
  TextField,
  Divider,
  Snackbar,
  Alert
} from '@mui/material';
import { useColorScheme } from '@mui/material/styles';

function Configuracions() {
  const { mode, setMode } = useColorScheme();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [fontSize, setFontSize] = React.useState(14);
  const [language, setLanguage] = React.useState('es');
  const [username, setUsername] = React.useState('');
  const [showSnackbar, setShowSnackbar] = React.useState(false);

  // Load saved preferences from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('userPrefs'));
    if (saved) {
      setFontSize(saved.fontSize || 14);
      setLanguage(saved.language || 'es');
      setUsername(saved.username || '');
      setSidebarOpen(saved.sidebarOpen ?? true);
      if (saved.mode && saved.mode !== mode) setMode(saved.mode);
    }
  }, []);

  const toggleMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    document.documentElement.setAttribute('data-theme', newMode);
  };

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const handleFontSize = (_, newValue) => {
    setFontSize(newValue);
  };

  const handleSave = () => {
    if (!username.trim()) {
      alert('Por favor, ingresa un nombre de usuario válido.');
      return;
    }

    const prefs = { mode, sidebarOpen, fontSize, language, username };
    localStorage.setItem('userPrefs', JSON.stringify(prefs));
    setShowSnackbar(true);
    console.log('Preferencias guardadas:', prefs);
  };

  return (
    <div className="mant-admin ">
      <Sidebar />
          
          <h2>Configuraciones</h2>
      <Box className="config-box">
        <Typography variant="h5" gutterBottom>
        </Typography>

        <Divider sx={{ my: 2 }} />

        <FormControlLabel
          control={<Switch checked={mode === 'dark'} onChange={toggleMode} />}
          label="Modo Oscuro"
        />

        <FormControlLabel
          control={<Switch checked={sidebarOpen} onChange={toggleSidebar} />}
          label="Sidebar Activo"
        />

        <Divider sx={{ my: 2 }} />

        <Typography gutterBottom>Tamaño de Fuente: {fontSize}px</Typography>
        <Slider
          value={fontSize}
          onChange={handleFontSize}
          min={10}
          max={24}
          step={1}
          valueLabelDisplay="auto"
        />

        <Divider sx={{ my: 2 }} />

        <Typography gutterBottom>Idioma de la interfaz</Typography>
        <Select
          value={language}
          onChange={e => setLanguage(e.target.value)}
          fullWidth
          variant="outlined"
        >
          <MenuItem value="es">Español</MenuItem>
          <MenuItem value="en">Inglés</MenuItem>
          <MenuItem value="pt">Portugués</MenuItem>
        </Select>

        <Divider sx={{ my: 2 }} />

        <TextField
          fullWidth
          label="Nombre de usuario"
          value={username}
          onChange={e => setUsername(e.target.value)}
          variant="outlined"
        />

        <Box sx={{ mt: 3, display: 'flex', gap: 2, margin: '20px auto'}}>
          <Button variant="contained" color="primary" onClick={handleSave}>
            Guardar cambios
          </Button>
          <Button  variant="outlined" onClick={() => window.history.back()}>
            Regresar
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled">
          Preferencias guardadas correctamente
        </Alert>
      </Snackbar>
    </div>
  );
}

export default Configuracions;