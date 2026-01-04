/**
 * UTILIDAD PARA SUBIR ARCHIVOS A DJANGO
 * Reemplaza la funcionalidad de S3
 */

/**
 * Validar archivo antes de subirlo
 */
export function validarArchivo(file, options = {}) {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB por defecto
    allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'],
  } = options;

  // Validar tamaño
  if (file.size > maxSize) {
    throw new Error(`El archivo es muy grande. Máximo ${maxSize / 1024 / 1024}MB`);
  }

  // Validar tipo
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Tipo de archivo no permitido. Permitidos: ${allowedTypes.join(', ')}`);
  }

  return true;
}

/**
 * Crear FormData con archivo e información adicional
 */
export function crearFormDataConArchivo(file, data = {}) {
  const formData = new FormData();
  
  // Añadir archivo
  formData.append('imagen', file);
  
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
 * Comprimir imagen antes de subir
 */
export async function comprimirImagen(file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calcular nuevas dimensiones
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        // Crear canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convertir a blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Crear nuevo archivo con el blob comprimido
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Error al comprimir imagen'));
            }
          },
          file.type,
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Error al cargar imagen para comprimir'));
      };
      
      img.src = e.target.result;
    };
    
    reader.onerror = () => {
      reject(new Error('Error al leer archivo'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Obtener URL completa de una imagen en Django
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
 */
export function obtenerExtension(filename) {
  return filename.split('.').pop().toLowerCase();
}

/**
 * Generar nombre único para archivo
 */
export function generarNombreUnico(originalName) {
  const timestamp = Date.now();
  const extension = obtenerExtension(originalName);
  const nameWithoutExt = originalName.replace(`.${extension}`, '');
  const cleanName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
  
  return `${cleanName}_${timestamp}.${extension}`;
}

/**
 * Validar PDF
 */
export function validarPDF(file, maxSize = 10 * 1024 * 1024) {
  if (file.type !== 'application/pdf') {
    throw new Error('El archivo debe ser un PDF');
  }
  
  if (file.size > maxSize) {
    throw new Error(`El PDF es muy grande. Máximo ${maxSize / 1024 / 1024}MB`);
  }
  
  return true;
}

/**
 * Hook React para manejar subida de imágenes
 * Uso en componentes:
 * 
 * const { uploading, preview, handleFileSelect, clearPreview } = useImageUpload();
 */
export function useImageUpload() {
  const [uploading, setUploading] = React.useState(false);
  const [preview, setPreview] = React.useState(null);
  const [file, setFile] = React.useState(null);

  const handleFileSelect = async (event) => {
    const selectedFile = event.target.files[0];
    
    if (!selectedFile) return;

    try {
      // Validar
      validarArchivo(selectedFile);
      
      // Crear preview
      const previewUrl = await previsualizarImagen(selectedFile);
      setPreview(previewUrl);
      setFile(selectedFile);
      
      return selectedFile;
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      alert(error.message);
      return null;
    }
  };

  const clearPreview = () => {
    setPreview(null);
    setFile(null);
  };

  return {
    uploading,
    preview,
    file,
    handleFileSelect,
    clearPreview,
    setUploading,
  };
}

export default {
  validarArchivo,
  crearFormDataConArchivo,
  previsualizarImagen,
  comprimirImagen,
  obtenerUrlImagen,
  obtenerExtension,
  generarNombreUnico,
  validarPDF,
  useImageUpload,
};