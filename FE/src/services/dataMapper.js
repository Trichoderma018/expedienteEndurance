// ============================================
// DATA MAPPER - Frontend ↔ Backend
// ============================================

/**
 * Mapear Expediente del Backend al Frontend
 */
export function mapExpedienteFromBackend(expediente) {
  return {
    id: expediente.id,
    user: expediente.user,
    imagen: expediente.imagen_url || expediente.imagen,
    genero: expediente.genero === 'M' ? 'masculino' : 
            expediente.genero === 'F' ? 'femenino' : 'otro',
    activo: expediente.activo,
    rol: expediente.usuario?.rol || 'user',
    sede: expediente.usuario?.sede || '',
    nombreCompleto: expediente.usuario?.nombre_completo || 
                    `${expediente.usuario?.first_name || ''} ${expediente.usuario?.last_name || ''}`.trim(),
    comentario1: expediente.comentario_general || '',
    comentario2: expediente.comentario_academico || '',
    comentario3: expediente.comentario_economico || '',
    fechaExpediente: expediente.fecha_creacion?.split('T')[0] || '',
  };
}

/**
 * Mapear Expediente del Frontend al Backend
 */
export function mapExpedienteToBackend(expediente) {
  return {
    user: parseInt(expediente.user),
    genero: expediente.genero === 'masculino' ? 'M' : 
            expediente.genero === 'femenino' ? 'F' : 'O',
    activo: expediente.activo === 'activo' || expediente.activo === true,
    comentario_general: expediente.comentario1 || '',
    comentario_academico: expediente.comentario2 || '',
    comentario_economico: expediente.comentario3 || '',
  };
}

/**
 * Mapear Usuario del Backend al Frontend
 */
export function mapUsuarioFromBackend(usuario) {
  return {
    id: usuario.id,
    username: usuario.username,
    name: usuario.nombre_completo || `${usuario.first_name} ${usuario.last_name}`.trim(),
    nombre: usuario.nombre_completo || `${usuario.first_name} ${usuario.last_name}`.trim(),
    email: usuario.email,
    sede: usuario.sede || '',
    rol: usuario.rol || 'user',
    activo: usuario.activo,
    tiene_expediente: usuario.tiene_expediente || false,
  };
}

/**
 * Mapear Usuario del Frontend al Backend
 */
export function mapUsuarioToBackend(usuario) {
  return {
    username: usuario.username,
    email: usuario.email,
    first_name: usuario.first_name || usuario.nombre?.split(' ')[0] || '',
    last_name: usuario.last_name || usuario.nombre?.split(' ').slice(1).join(' ') || '',
    sede: usuario.sede,
    rol: usuario.rol || 'user',
  };
}

/**
 * Mapear Visita del Backend al Frontend
 */
export function mapVisitaFromBackend(visita) {
  return {
    id: visita.id,
    expediente: visita.expediente,
    nombreCompleto: visita.expediente_user?.nombre_completo || '',
    rol: visita.expediente_user?.rol || '',
    
    // Información Académica
    institucion: visita.institucion || '',
    anoAcademico: visita.ano_academico || '',
    adecuacion: visita.adecuacion || '',
    tipoAdecuacion: visita.tipo_adecuacion || '',
    beca: visita.tiene_beca ? 'si' : 'no',
    montoBeca: visita.monto_beca || 0,
    institucionBeca: visita.institucion_beca || '',
    comentario: visita.comentario_general || '',
    adjuntoNotas: visita.adjunto_notas_url || visita.adjunto_notas,
    
    // Datos Personales
    fechaNacimiento: visita.fecha_nacimiento || '',
    edad: visita.edad || '',
    cedula: visita.cedula || '',
    telefono1: visita.telefono_principal || '',
    telefono2: visita.telefono_secundario || '',
    lugarResidencia: visita.direccion || '',
    
    // Datos Técnicos
    lesiones: visita.lesiones || '',
    enfermedades: visita.enfermedades || '',
    tratamientos: visita.tratamientos || '',
    atencionMedica: visita.atencion_medica || '',
    drogas: visita.drogas || '',
    disponibilidad: visita.disponibilidad || '',
    
    // Vivienda
    casa: visita.tipo_vivienda || '',
    montoCasa: visita.monto_vivienda || 0,
    especificaciones: visita.especificaciones_vivienda || '',
    comentario4: visita.comentario_vivienda || '',
    
    // Trabajo
    trabaja: visita.trabaja ? 'si' : 'no',
    empresa: visita.empresa || '',
    salario: visita.salario || 0,
    comentario5: visita.comentario_empleo || '',
    
    // Familia (primer familiar)
    nombreFamiliar: visita.familiares?.[0]?.nombre_completo || '',
    edadFamiliar: visita.familiares?.[0]?.edad || '',
    parentesco: visita.familiares?.[0]?.parentesco || '',
    ocupacion: visita.familiares?.[0]?.ocupacion || '',
    ingresoMensual: visita.familiares?.[0]?.ingreso_mensual || 0,
    lugarTrabajo: visita.familiares?.[0]?.lugar_trabajo || '',
    
    // Economía
    ingresos: visita.ingresos_totales || 0,
    gastos: visita.gastos_totales || 0,
    comida: visita.gasto_alimentacion || 0,
    agua: visita.gasto_agua || 0,
    luz: visita.gasto_luz || 0,
    internetCable: visita.gasto_internet_cable || 0,
    celular: visita.gasto_celular || 0,
    viaticos: visita.gasto_transporte || 0,
    salud: visita.gasto_salud || 0,
    deudas: visita.deudas || 0,
    
    // Campos calculados o adicionales
    salario2: 0, // Campo adicional del frontend
    pension: 0,  // Campo adicional del frontend
    beca2: visita.monto_beca || 0,
    
    fechaVisita: visita.fecha_visita || visita.fecha_registro,
    created_at: visita.fecha_registro,
  };
}

/**
 * Mapear Visita del Frontend al Backend
 */
export function mapVisitaToBackend(visita) {
  return {
    expediente: parseInt(visita.expediente),
    
    // Información Académica
    institucion: visita.institucion,
    ano_academico: visita.anoAcademico,
    adecuacion: visita.adecuacion,
    tipo_adecuacion: visita.tipoAdecuacion,
    tiene_beca: visita.beca === 'si',
    monto_beca: parseFloat(visita.montoBeca) || 0,
    institucion_beca: visita.institucionBeca,
    
    // Datos Personales
    fecha_nacimiento: visita.fechaNacimiento,
    cedula: visita.cedula,
    telefono_principal: visita.telefono1,
    telefono_secundario: visita.telefono2,
    direccion: visita.lugarResidencia,
    
    // Datos Técnicos
    lesiones: visita.lesiones,
    enfermedades: visita.enfermedades,
    tratamientos: visita.tratamientos,
    atencion_medica: visita.atencionMedica,
    drogas: visita.drogas,
    disponibilidad: visita.disponibilidad,
    
    // Vivienda
    tipo_vivienda: visita.casa,
    monto_vivienda: parseFloat(visita.montoCasa) || 0,
    especificaciones_vivienda: visita.especificaciones,
    
    // Trabajo
    trabaja: visita.trabaja === 'si',
    empresa: visita.empresa,
    salario: parseFloat(visita.salario) || 0,
    comentario_empleo: visita.comentario5,
    
    // Economía
    ingresos_totales: parseFloat(visita.ingresos) || 0,
    gastos_totales: parseFloat(visita.gastos) || 0,
    gasto_alimentacion: parseFloat(visita.comida) || 0,
    gasto_agua: parseFloat(visita.agua) || 0,
    gasto_luz: parseFloat(visita.luz) || 0,
    gasto_internet_cable: parseFloat(visita.internetCable) || 0,
    gasto_celular: parseFloat(visita.celular) || 0,
    gasto_transporte: parseFloat(visita.viaticos) || 0,
    gasto_salud: parseFloat(visita.salud) || 0,
    deudas: parseFloat(visita.deudas) || 0,
    
    observaciones: visita.comentario || '',
    fecha_visita: visita.fechaVisita || new Date().toISOString().split('T')[0],
    
    // Familiares - se enviarán por separado si existen
    familiares: visita.nombreFamiliar ? [{
      nombre_completo: visita.nombreFamiliar,
      edad: parseInt(visita.edadFamiliar) || 0,
      parentesco: visita.parentesco,
      ocupacion: visita.ocupacion,
      ingreso_mensual: parseFloat(visita.ingresoMensual) || 0,
      lugar_trabajo: visita.lugarTrabajo,
    }] : [],
  };
}

/**
 * Mapear Proyecto del Backend al Frontend
 */
export function mapProyectoFromBackend(proyecto) {
  return {
    id: proyecto.id,
    nombreProyecto: proyecto.nombre,
    objetivo: proyecto.objetivo,
    descripcion: proyecto.descripcion,
    imagen: proyecto.imagen_url || proyecto.imagen,
    fechaInicio: proyecto.fecha_inicio,
    fechaFin: proyecto.fecha_fin,
    activo: proyecto.activo,
    usuarios: proyecto.participantes?.map(p => p.usuario) || [],
    total_participantes: proyecto.total_participantes || 0,
  };
}

/**
 * Mapear Proyecto del Frontend al Backend
 */
export function mapProyectoToBackend(proyecto) {
  return {
    nombre: proyecto.nombreProyecto,
    objetivo: proyecto.objetivo,
    descripcion: proyecto.descripcion,
    fecha_inicio: proyecto.fechaInicio,
    fecha_fin: proyecto.fechaFin,
    activo: proyecto.activo === 'activo' || proyecto.activo === true,
    usuarios_ids: proyecto.usuarios || [],
  };
}

/**
 * Mapear lista de items (genérico)
 */
export function mapList(items, mapperFunction) {
  if (!Array.isArray(items)) return [];
  return items.map(mapperFunction);
}