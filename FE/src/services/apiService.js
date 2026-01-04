import axios from 'axios';

// ============================================
// CONFIGURACIÓN BASE
// ============================================
const API_URL = 'http://127.0.0.1:8000/api/';

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// INTERCEPTOR DE REQUEST - Añadir JWT Token
// ============================================
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================
// INTERCEPTOR DE RESPONSE - Refrescar Token
// ============================================
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el token expiró (401) y no hemos intentado refrescarlo
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          // No hay refresh token, redirigir al login
          localStorage.clear();
          window.location.href = '/';
          return Promise.reject(error);
        }

        // Intentar refrescar el token
        const response = await axios.post(`${API_URL}token/refresh/`, {
          refresh: refreshToken
        });

        const { access } = response.data;
        
        // Guardar nuevo access token
        localStorage.setItem('access_token', access);
        
        // Reintentar la petición original con el nuevo token
        originalRequest.headers['Authorization'] = `Bearer ${access}`;
        return axiosInstance(originalRequest);
        
      } catch (refreshError) {
        // Error al refrescar, cerrar sesión
        console.error('Error refreshing token:', refreshError);
        localStorage.clear();
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ============================================
// FUNCIONES PRINCIPALES DE API
// ============================================

/**
 * GET - Obtener datos
 */
async function getData(endpoint) {
  try {
    const response = await axiosInstance.get(endpoint);
    return response.data;
  } catch (error) {
    console.error(`Error GET ${endpoint}:`, error);
  }
}

/**
 * POST - Crear datos
 */
async function postData(data, endpoint) {
  try {
    const response = await axiosInstance.post(endpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Error POST ${endpoint}:`, error);
  }
}

/**
 * POST con FormData (para archivos)
 */
async function postFormData(formData, endpoint) {
  try {
    const response = await axiosInstance.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error POST FormData ${endpoint}:`, error);
  }
}

/**
 * PATCH - Actualizar datos
 */
async function patchData(data, endpoint, id) {
  try {
    const url = id ? `${endpoint}/${id}/` : endpoint;
    const response = await axiosInstance.patch(url, data);
    return response.data;
  } catch (error) {
    console.error(`Error PATCH ${endpoint}/${id}:`, error);
  }
}

/**
 * PATCH con FormData
 */
async function patchFormData(formData, endpoint, id) {
  try {
    const url = id ? `${endpoint}/${id}/` : endpoint;
    const response = await axiosInstance.patch(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error PATCH FormData ${endpoint}/${id}:`, error);
  }
}

/**
 * DELETE - Eliminar datos
 */
async function deleteData(endpoint, id) {
  try {
    const url = id ? `${endpoint}/${id}/` : endpoint;
    await axiosInstance.delete(url);
    return { message: `Registro eliminado exitosamente` };
  } catch (error) {
    console.error(`Error DELETE ${endpoint}/${id}:`, error);
  }
}

// ============================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================

/**
 * Login de usuario
 */
async function login(username, password) {
  try {
    const response = await axios.post(`${API_URL}auth/login/`, {
      username,
      password,
    });

    const { access, refresh, user } = response.data;

    // Guardar tokens y usuario
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('usuarioActual', JSON.stringify(user));

    return response.data;
  } catch (error) {
    console.error('Error en login:', error);
  }
}

/**
 * Registro de usuario
 */
async function registro(userData) {
  try {
    const response = await axios.post(`${API_URL}auth/registro/`, userData);
    return response.data;
  } catch (error) {
    console.error('Error en registro:', error);
  }
}

/**
 * Obtener perfil del usuario actual
 */
async function getPerfil() {
  try {
    const response = await axiosInstance.get('auth/perfil/');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
  }
}

/**
 * Cerrar sesión
 */
function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('usuarioActual');
  window.location.href = '/';
}

// ============================================
// EXPORTAR TODO
// ============================================
const apiService = {
  // CRUD básico
  getData,
  postData,
  postFormData,
  patchData,
  patchFormData,
  deleteData,
  
  // Autenticación
  login,
  registro,
  getPerfil,
  logout,
  
  // Acceso directo a axios instance
  axiosInstance,
};

export default apiService;