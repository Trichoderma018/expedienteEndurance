/**
 * UTILIDAD PARA SUBIR ARCHIVOS A DJANGO
 * Sistema simplificado sin compresión - solo validación
 */

/**
 * Validar archivo antes de subirlo
 * @param {File} file - Archivo a validar
 * @param {string} tipo - Tipo de archivo ('imagen' o 'pdf')
 */
export function validarArchivo(file, tipo = 'imagen') {
  const limites = {
    imagen: {
      maxSize: 5 * 1024 * 1024, // 5MB
      tipos: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'],
      nombreTipo: 'imagen'
    },
    pdf: {
      maxSize: 10 * 1024 * 1024, // 10MB
      tipos: ['application/pdf'],
      nombreTipo: 'PDF'
    }
  };
  
  const config = limites[tipo];
  
  if (!config) {
    throw new Error(`Tipo de validación no soportado: ${tipo}`);
  }

  // Validar tamaño
  if (file.size > config.maxSize) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(2);
    const maxMB = (config.maxSize / 1024 / 1024).toFixed(0);
    throw new Error(
      `El ${config.nombreTipo} es muy grande (${sizeMB}MB). Máximo: ${maxMB}MB`
    );
  }

  // Validar tipo
  if (!config.tipos.includes(file.type)) {
    throw new Error(
      `Tipo de archivo no permitido. Permitidos: ${config.tipos.join(', ')}`
    );
  }

  return true;
}

/**
 * Crear FormData con archivo e información adicional
 * @param {File} file - Archivo a subir
 * @param {string} nombreCampo - Nombre del campo para el archivo (ej: 'imagen', 'imagen_perfil', 'adjunto_notas')
 * @param {Object} data - Datos adicionales a incluir en el FormData
 */
export function crearFormDataConArchivo(file, nombreCampo = 'imagen', data = {}) {
  const formData = new FormData();
  
  // Añadir archivo con el nombre de campo especificado
  formData.append(nombreCampo, file);
  
  // Añadir campos adicionales
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });
  
  return formData;
}

/**
 * Previsualizar imagen antes de subir
 * @param {File} file - Archivo de imagen
 * @returns {Promise<string>} - Data URL de la imagen
 */
export function previsualizarImagen(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      resolve(e.target.result);
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Obtener URL completa de una imagen en Django
 * @param {string} imagenPath - Ruta de la imagen
 * @returns {string|null} - URL completa o null
 */
export function obtenerUrlImagen(imagenPath) {
  if (!imagenPath) return null;
  
  // Si ya es una URL completa, devolverla tal cual
  if (imagenPath.startsWith('http')) {
    return imagenPath;
  }
  
  // Si es una ruta relativa, construir URL completa
  const baseURL = 'http://127.0.0.1:8000';
  return `${baseURL}${imagenPath.startsWith('/') ? '' : '/'}${imagenPath}`;
}

/**
 * Obtener extensión del archivo
 * @param {string} filename - Nombre del archivo
 * @returns {string} - Extensión en minúsculas
 */
export function obtenerExtension(filename) {
  return filename.split('.').pop().toLowerCase();
}

/**
 * Generar nombre único para archivo
 * @param {string} originalName - Nombre original del archivo
 * @returns {string} - Nombre único generado
 */
export function generarNombreUnico(originalName) {
  const timestamp = Date.now();
  const extension = obtenerExtension(originalName);
  const nameWithoutExt = originalName.replace(`.${extension}`, '');
  const cleanName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
  
  return `${cleanName}_${timestamp}.${extension}`;
}

/**
 * Validar PDF (alias de validarArchivo para mantener compatibilidad)
 * @param {File} file - Archivo PDF
 * @param {number} maxSize - Tamaño máximo en bytes (default: 10MB)
 */
export function validarPDF(file, maxSize = 10 * 1024 * 1024) {
  if (file.type !== 'application/pdf') {
    throw new Error('El archivo debe ser un PDF');
  }
  
  if (file.size > maxSize) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(2);
    const maxMB = (maxSize / 1024 / 1024).toFixed(0);
    throw new Error(`El PDF es muy grande (${sizeMB}MB). Máximo: ${maxMB}MB`);
  }
  
  return true;
}

/**
 * Hook React para manejar subida de imágenes
 * 
 * @example
 * const { uploading, preview, file, handleFileSelect, clearPreview } = useImageUpload();
 * 
 * <input type="file" onChange={handleFileSelect} accept="image/*" />
 * {preview && <img src={preview} alt="Preview" />}
 */
export function useImageUpload() {
  const [uploading, setUploading] = React.useState(false);
  const [preview, setPreview] = React.useState(null);
  const [file, setFile] = React.useState(null);
  const [error, setError] = React.useState(null);

  const handleFileSelect = async (event) => {
    const selectedFile = event.target.files[0];
    
    if (!selectedFile) return null;

    try {
      setError(null);
      
      // Validar
      validarArchivo(selectedFile, 'imagen');
      
      // Crear preview
      const previewUrl = await previsualizarImagen(selectedFile);
      setPreview(previewUrl);
      setFile(selectedFile);
      
      return selectedFile;
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      setError(error.message);
      setPreview(null);
      setFile(null);
      return null;
    }
  };

  const clearPreview = () => {
    setPreview(null);
    setFile(null);
    setError(null);
  };

  return {
    uploading,
    preview,
    file,
    error,
    handleFileSelect,
    clearPreview,
    setUploading,
  };
}

/**
 * Hook React para manejar subida de PDFs
 * 
 * @example
 * const { file, handleFileSelect, clearFile } = usePDFUpload();
 */
export function usePDFUpload() {
  const [uploading, setUploading] = React.useState(false);
  const [file, setFile] = React.useState(null);
  const [error, setError] = React.useState(null);

  const handleFileSelect = async (event) => {
    const selectedFile = event.target.files[0];
    
    if (!selectedFile) return null;

    try {
      setError(null);
      
      // Validar
      validarArchivo(selectedFile, 'pdf');
      setFile(selectedFile);
      
      return selectedFile;
    } catch (error) {
      console.error('Error al seleccionar PDF:', error);
      setError(error.message);
      setFile(null);
      return null;
    }
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
  };

  return {
    uploading,
    file,
    error,
    handleFileSelect,
    clearFile,
    setUploading,
  };
}

export default {
  validarArchivo,
  crearFormDataConArchivo,
  previsualizarImagen,
  obtenerUrlImagen,
  obtenerExtension,
  generarNombreUnico,
  validarPDF,
  useImageUpload,
  usePDFUpload,
};