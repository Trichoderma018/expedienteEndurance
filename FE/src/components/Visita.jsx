import React, { useState, useEffect, useRef } from 'react'
import Llamados from '../services/Llamados'
import "../style/ExpeInput.css"
import "../style/visita.css"




function Visita() {
    // Estados para información básica
    const [expedientes, setExpedientes] = useState([])
    const [expedienteSeleccionado, setExpedienteSeleccionado] = useState("")
    const [nombreCompleto, setNombreCompleto] = useState("")
    const [rol, setRol] = useState("")
    
    // Estados para Notas
    const [institucion, setInstitucion] = useState("")
    const [anoAcademico, setAnoAcademico] = useState("")
    const [adecuacion, setAdecuacion] = useState("")
    const [tipoAdecuacion, setTipoAdecuacion] = useState("")
    const [beca, setBeca] = useState("")
    const [montoBeca, setMontoBeca] = useState(0)
    const [institucionBeca, setInstitucionBeca] = useState("")
    const [comentario, setComentario] = useState("")
    const [adjuntoNotas, setAdjuntoNotas] = useState("")
    
    // Estados para Datos Personales
    const [fechaNacimiento, setFechaNacimiento] = useState("")
    const [edad, setEdad] = useState("")
    const [cedula, setCedula] = useState("")
    const [telefono1, setTelefono1] = useState("")
    const [telefono2, setTelefono2] = useState("")
    const [lugarResidencia, setLugarResidencia] = useState("")
    
    // Estados para Datos Técnicos
    const [lesiones, setLesiones] = useState("")
    const [enfermedades, setEnfermedades] = useState("")
    const [tratamientos, setTratamientos] = useState("")
    const [atencionMedica, setAtencionMedica] = useState("")
    const [drogas, setDrogas] = useState("")
    const [disponibilidad, setDisponibilidad] = useState("")
    
    // Estados para Vivienda
    const [casa, setCasa] = useState("")
    const [montoCasa, setMontoCasa] = useState(0)
    const [especificaciones, setEspecificaciones] = useState("")
    const [comentario4, setComentario4] = useState("")
    
    // Estados para Trabajo
    const [trabaja, setTrabaja] = useState("")
    const [empresa, setEmpresa] = useState("")
    const [salario, setSalario] = useState(0)
    const [comentario5, setComentario5] = useState("")
    
    // Estados para Familia
    const [nombreFamiliar, setNombreFamiliar] = useState("")
    const [edadFamiliar, setEdadFamiliar] = useState("")
    const [parentesco, setParentesco] = useState("")
    const [ocupacion, setOcupacion] = useState("")
    const [ingresoMensual, setIngresoMensual] = useState(0)
    const [lugarTrabajo, setLugarTrabajo] = useState("")
    
    // Estados para Ingresos y Gastos
    const [ingresos, setIngresos] = useState(0)
    const [salario2, setSalario2] = useState(0)
    const [pension, setPension] = useState(0)
    const [beca2, setBeca2] = useState(0)
    const [gastos, setGastos] = useState(0)
    const [comida, setComida] = useState(0)
    const [agua, setAgua] = useState(0)
    const [luz, setLuz] = useState(0)
    const [internetCable, setInternetCable] = useState(0)
    const [celular, setCelular] = useState(0)
    const [viaticos, setViaticos] = useState(0)
    const [salud, setSalud] = useState(0)
    const [deudas, setDeudas] = useState(0)
    
    // Estados de control
    const [visitas, setVisitas] = useState([])
    const [editMode, setEditMode] = useState(false)
    const [currentVisitaId, setCurrentVisitaId] = useState(null)
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    
    const fileInputRef = useRef(null)

    useEffect(() => {
        obtenerExpedientes()
        obtenerVisitas()
    }, [])

    useEffect(() => {
    // Verificar si viene de View con un expediente preseleccionado
    const expedienteParaVisitaId = localStorage.getItem('expedienteParaVisita');
    
    if (expedienteParaVisitaId && expedientes.length > 0) {
        cargarDatosExpedientePreseleccionado(expedienteParaVisitaId);
        // Limpiar localStorage después de usar
        localStorage.removeItem('expedienteParaVisita');
    }
}, [expedientes]); // Dependencia en expedientes para asegurar que estén cargados

// Nueva función para cargar datos del expediente preseleccionado
async function cargarDatosExpedientePreseleccionado(expedienteId) {
    try {
        // Buscar el expediente en la lista ya cargada
        const expedienteSeleccionado = expedientes.find(exp => exp.id === parseInt(expedienteId));
        
        if (expedienteSeleccionado) {
            // Llenar campos básicos automáticamente
            setExpedienteSeleccionado(expedienteId);
            setRol(expedienteSeleccionado.rol || "");
            
            // Obtener datos del usuario asociado al expediente
            if (expedienteSeleccionado.user) {
                try {
                    const usuarioData = await Llamados.getData(`api/users/${expedienteSeleccionado.user}/`);
                    setNombreCompleto(usuarioData.name || usuarioData.username || "");
                } catch (error) {
                    console.error("Error obteniendo datos del usuario:", error);
                    // Fallback: intentar usar datos que ya puedan estar disponibles
                    setNombreCompleto(expedienteSeleccionado.user?.name || expedienteSeleccionado.user?.username || "");
                }
            }
            
            console.log("Datos del expediente preseleccionado cargados:", {
                expediente: expedienteId,
                rol: expedienteSeleccionado.rol,
                usuario: expedienteSeleccionado.user
            });
        } else {
            console.warn("No se encontró el expediente con ID:", expedienteId);
        }
    } catch (error) {
        console.error("Error cargando datos del expediente preseleccionado:", error);
    }
}

    async function obtenerExpedientes() {
        try {
            const response = await Llamados.getData('api/expedientes/')
            console.log("Expedientes obtenidos:", response)
            setExpedientes(response.data || response)
        } catch (error) {
            console.error("Error obteniendo expedientes:", error)
        }
    }

    async function obtenerVisitas() {
        try {
            const response = await Llamados.getData('api/visitas/')
            console.log("Visitas obtenidas:", response)
            setVisitas(response.data || response)
        } catch (error) {
            console.error("Error obteniendo visitas:", error)
        }
    }

    const handleFileChange = async (event) => {
        const file = event.target.files[0]
        if (file) {
            try {
                const result = await uploadImageToS3(file)
                setAdjuntoNotas(result.Location)
            } catch (error) {
                console.error('Error al subir archivo:', error)
                setError('No se pudo subir el archivo')
            }
        }
    }

    async function crearVisita() {
        try {
            const objVisita = {
                expediente: expedienteSeleccionado,
                nombreCompleto: nombreCompleto,
                rol: rol,
                // Notas
                institucion: institucion,
                anoAcademico: anoAcademico,
                adecuacion: adecuacion,
                tipoAdecuacion: tipoAdecuacion,
                beca: beca,
                montoBeca: parseInt(montoBeca) || 0,
                institucionBeca: institucionBeca,
                comentario: comentario,
                adjuntoNotas: adjuntoNotas,
                // Datos Personales
                fechaNacimiento: fechaNacimiento,
                edad: edad,
                cedula: cedula,
                telefono1: telefono1,
                telefono2: telefono2,
                lugarResidencia: lugarResidencia,
                // Datos Técnicos
                lesiones: lesiones,
                enfermedades: enfermedades,
                tratamientos: tratamientos,
                atencionMedica: atencionMedica,
                drogas: drogas,
                disponibilidad: disponibilidad,
                // Vivienda
                casa: casa,
                montoCasa: parseInt(montoCasa) || 0,
                especificaciones: especificaciones,
                comentario4: comentario4,
                // Trabajo
                trabaja: trabaja,
                empresa: empresa,
                salario: parseInt(salario) || 0,
                comentario5: comentario5,
                // Familia
                nombreFamiliar: nombreFamiliar,
                edadFamiliar: edadFamiliar,
                parentesco: parentesco,
                ocupacion: ocupacion,
                ingresoMensual: parseInt(ingresoMensual) || 0,
                lugarTrabajo: lugarTrabajo,
                // Ingresos y Gastos
                ingresos: parseInt(ingresos) || 0,
                salario2: parseInt(salario2) || 0,
                pension: parseInt(pension) || 0,
                beca2: parseInt(beca2) || 0,
                gastos: parseInt(gastos) || 0,
                comida: parseInt(comida) || 0,
                agua: parseInt(agua) || 0,
                luz: parseInt(luz) || 0,
                internetCable: parseInt(internetCable) || 0,
                celular: parseInt(celular) || 0,
                viaticos: parseInt(viaticos) || 0,
                salud: parseInt(salud) || 0,
                deudas: parseInt(deudas) || 0
            }
            
            console.log('Objeto visita a enviar:', objVisita)
            await Llamados.postData(objVisita, 'api/visitas/')
            
            limpiarFormulario()
            obtenerVisitas()
            
        } catch (error) {
            console.error("Error al crear visita:", error)
            setError("Error al crear la visita")
        }
    }

    async function actualizarVisita() {
        try {
            const objVisita = {
                expediente: expedienteSeleccionado,
                nombreCompleto: nombreCompleto,
                rol: rol,
                // Notas
                institucion: institucion,
                anoAcademico: anoAcademico,
                adecuacion: adecuacion,
                tipoAdecuacion: tipoAdecuacion,
                beca: beca,
                montoBeca: parseInt(montoBeca) || 0,
                institucionBeca: institucionBeca,
                comentario: comentario,
                adjuntoNotas: adjuntoNotas,
                // Datos Personales
                fechaNacimiento: fechaNacimiento,
                edad: edad,
                cedula: cedula,
                telefono1: telefono1,
                telefono2: telefono2,
                lugarResidencia: lugarResidencia,
                // Datos Técnicos
                lesiones: lesiones,
                enfermedades: enfermedades,
                tratamientos: tratamientos,
                atencionMedica: atencionMedica,
                drogas: drogas,
                disponibilidad: disponibilidad,
                // Vivienda
                casa: casa,
                montoCasa: parseInt(montoCasa) || 0,
                especificaciones: especificaciones,
                comentario4: comentario4,
                // Trabajo
                trabaja: trabaja,
                empresa: empresa,
                salario: parseInt(salario) || 0,
                comentario5: comentario5,
                // Familia
                nombreFamiliar: nombreFamiliar,
                edadFamiliar: edadFamiliar,
                parentesco: parentesco,
                ocupacion: ocupacion,
                ingresoMensual: parseInt(ingresoMensual) || 0,
                lugarTrabajo: lugarTrabajo,
                // Ingresos y Gastos
                ingresos: parseInt(ingresos) || 0,
                salario2: parseInt(salario2) || 0,
                pension: parseInt(pension) || 0,
                beca2: parseInt(beca2) || 0,
                gastos: parseInt(gastos) || 0,
                comida: parseInt(comida) || 0,
                agua: parseInt(agua) || 0,
                luz: parseInt(luz) || 0,
                internetCable: parseInt(internetCable) || 0,
                celular: parseInt(celular) || 0,
                viaticos: parseInt(viaticos) || 0,
                salud: parseInt(salud) || 0,
                deudas: parseInt(deudas) || 0
            }
            
            await Llamados.patchData(objVisita, "api/visitas", currentVisitaId)
            
            limpiarFormulario()
            setEditMode(false)
            setCurrentVisitaId(null)
            obtenerVisitas()
            
        } catch (error) {
            console.error("Error al actualizar visita:", error)
            setError("Error al actualizar la visita")
        }
    }

    async function eliminarVisita(id) {
        if (window.confirm("¿Está seguro que desea eliminar esta visita?")) {
            try {
                await Llamados.deleteData("api/visitas", id)
                obtenerVisitas()
            } catch (error) {
                console.error("Error al eliminar visita:", error)
                setError("Error al eliminar visita")
            }
        }
    }

    function editarVisita(visita) {
        // Cargar datos básicos
        setExpedienteSeleccionado(visita.expediente || "")
        setNombreCompleto(visita.nombreCompleto || "")
        setRol(visita.rol || "")
        
        // Cargar Notas
        setInstitucion(visita.institucion || "")
        setAnoAcademico(visita.anoAcademico || "")
        setAdecuacion(visita.adecuacion || "")
        setTipoAdecuacion(visita.tipoAdecuacion || "")
        setBeca(visita.beca || "")
        setMontoBeca(visita.montoBeca || 0)
        setInstitucionBeca(visita.institucionBeca || "")
        setComentario(visita.comentario || "")
        setAdjuntoNotas(visita.adjuntoNotas || "")
        
        // Cargar Datos Personales
        setFechaNacimiento(visita.fechaNacimiento || "")
        setEdad(visita.edad || "")
        setCedula(visita.cedula || "")
        setTelefono1(visita.telefono1 || "")
        setTelefono2(visita.telefono2 || "")
        setLugarResidencia(visita.lugarResidencia || "")
        
        // Cargar Datos Técnicos
        setLesiones(visita.lesiones || "")
        setEnfermedades(visita.enfermedades || "")
        setTratamientos(visita.tratamientos || "")
        setAtencionMedica(visita.atencionMedica || "")
        setDrogas(visita.drogas || "")
        setDisponibilidad(visita.disponibilidad || "")
        
        // Cargar Vivienda
        setCasa(visita.casa || "")
        setMontoCasa(visita.montoCasa || 0)
        setEspecificaciones(visita.especificaciones || "")
        setComentario4(visita.comentario4 || "")
        
        // Cargar Trabajo
        setTrabaja(visita.trabaja || "")
        setEmpresa(visita.empresa || "")
        setSalario(visita.salario || 0)
        setComentario5(visita.comentario5 || "")
        
        // Cargar Familia
        setNombreFamiliar(visita.nombreFamiliar || "")
        setEdadFamiliar(visita.edadFamiliar || "")
        setParentesco(visita.parentesco || "")
        setOcupacion(visita.ocupacion || "")
        setIngresoMensual(visita.ingresoMensual || 0)
        setLugarTrabajo(visita.lugarTrabajo || "")
        
        // Cargar Ingresos y Gastos
        setIngresos(visita.ingresos || 0)
        setSalario2(visita.salario2 || 0)
        setPension(visita.pension || 0)
        setBeca2(visita.beca2 || 0)
        setGastos(visita.gastos || 0)
        setComida(visita.comida || 0)
        setAgua(visita.agua || 0)
        setLuz(visita.luz || 0)
        setInternetCable(visita.internetCable || 0)
        setCelular(visita.celular || 0)
        setViaticos(visita.viaticos || 0)
        setSalud(visita.salud || 0)
        setDeudas(visita.deudas || 0)
        
        setCurrentVisitaId(visita.id)
        setEditMode(true)
    }

    function limpiarFormulario() {
        // Limpiar datos básicos
        setExpedienteSeleccionado("")
        setNombreCompleto("")
        setRol("")
        
        // Limpiar Notas
        setInstitucion("")
        setAnoAcademico("")
        setAdecuacion("")
        setTipoAdecuacion("")
        setBeca("")
        setMontoBeca(0)
        setInstitucionBeca("")
        setComentario("")
        setAdjuntoNotas("")
        
        // Limpiar Datos Personales
        setFechaNacimiento("")
        setEdad("")
        setCedula("")
        setTelefono1("")
        setTelefono2("")
        setLugarResidencia("")
        
        // Limpiar Datos Técnicos
        setLesiones("")
        setEnfermedades("")
        setTratamientos("")
        setAtencionMedica("")
        setDrogas("")
        setDisponibilidad("")
        
        // Limpiar Vivienda
        setCasa("")
        setMontoCasa(0)
        setEspecificaciones("")
        setComentario4("")
        
        // Limpiar Trabajo
        setTrabaja("")
        setEmpresa("")
        setSalario(0)
        setComentario5("")
        
        // Limpiar Familia
        setNombreFamiliar("")
        setEdadFamiliar("")
        setParentesco("")
        setOcupacion("")
        setIngresoMensual(0)
        setLugarTrabajo("")
        
        // Limpiar Ingresos y Gastos
        setIngresos(0)
        setSalario2(0)
        setPension(0)
        setBeca2(0)
        setGastos(0)
        setComida(0)
        setAgua(0)
        setLuz(0)
        setInternetCable(0)
        setCelular(0)
        setViaticos(0)
        setSalud(0)
        setDeudas(0)
        
        setEditMode(false)
        setCurrentVisitaId(null)
        setError(null)

        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    function handleSubmit(event) {
        event.preventDefault()
        setIsLoading(true)
        setError(null)
        
        // Validaciones básicas
        if (!expedienteSeleccionado || !nombreCompleto || !fechaNacimiento || !cedula || !telefono1) {
            setError('Por favor, complete todos los campos obligatorios.')
            setIsLoading(false)
            return
        }
        
        if (editMode) {
            actualizarVisita()
        } else {
            crearVisita()
        }
        setIsLoading(false)
    }

    function obtenerNombreExpediente(expedienteId) {
        const expediente = expedientes.find(exp => exp.id === expedienteId)
        return expediente ? expediente.user?.username || expediente.user?.name || 'Usuario no encontrado' : 'Expediente no encontrado'
    }

    return (
        <div className='visita-container'>
            <div className='header-bar'>
                <header className='title'>ENDURANCE</header>

            </div>
            
            <div className="form-container">
                <div className="form-header">
                    <h2>{editMode ? 'EDITAR VISITA' : 'NUEVA VISITA'}</h2>
                </div>
                
                <form onSubmit={handleSubmit} className="visita-form">
                    {/* Información Básica */}
                    <div className="form-section">
                        <div className="section-header">
                            <h3>Información Básica</h3>
                        </div>
                        <div className="form-grid">
                            <div className="field-group">
                                <label>Expediente *</label>
                                <select  className='form-input' value={expedienteSeleccionado} onChange={(e) => setExpedienteSeleccionado(e.target.value)} required
                                >
                                    <option value="">Seleccionar Expediente</option>
                                    {expedientes && expedientes.map((expediente) => (
                                        <option key={expediente.id} value={expediente.id}>
                                            {expediente.user?.username || expediente.user?.name || `ID: ${expediente.id}`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="field-group">
                                <label>Nombre Completo *</label>
                                <input  value={nombreCompleto} onChange={(e) => setNombreCompleto(e.target.value)}  className='form-input' type="text" placeholder="Nombre Completo"  required/>
                            </div>

                            <div className="field-group">
                                <label>Rol</label>
                                <input value={rol} onChange={(e) => setRol(e.target.value)} className='form-input' type="text" placeholder="Rol" />
                            </div>
                        </div>
                    </div>

                    {/* Notas Académicas */}
                    <div className="form-section">
                        <div className="section-header">
                            <h3>Información Académica</h3>
                        </div>
                        <div className="form-grid">
                            <div className="field-group">
                                <label>Institución</label>
                                <input value={institucion} onChange={(e) => setInstitucion(e.target.value)} className='form-input' type="text" placeholder="Institución" />
                            </div>

                            <div className="field-group">
                                <label>Año Académico</label>
                                <input value={anoAcademico} onChange={(e) => setAnoAcademico(e.target.value)} className='form-input' type="text" placeholder="Año Académico" />
                            </div>

                            <div className="field-group">
                                <label>Adecuación</label>
                                <input value={adecuacion} onChange={(e) => setAdecuacion(e.target.value)} className='form-input' type="text" placeholder="Adecuación" />
                            </div>

                            <div className="field-group">
                                <label>Tipo de Adecuación</label>
                                <input value={tipoAdecuacion} onChange={(e) => setTipoAdecuacion(e.target.value)} className='form-input' type="text" placeholder="Tipo de Adecuación" />
                            </div>

                            <div className="field-group">
                                <label>¿Tiene beca?</label>
                                <select className='form-input' value={beca} onChange={(e) => setBeca(e.target.value)}>
                                    <option value="">Seleccionar</option>
                                    <option value="si">Sí</option>
                                    <option value="no">No</option>
                                </select>
                            </div>

                            <div className="field-group">
                                <label>Monto de la Beca</label>
                                <input value={montoBeca} onChange={(e) => setMontoBeca(e.target.value)} className='form-input' type="number" placeholder="Monto de la Beca" />
                            </div>

                            <div className="field-group full-width">
                                <label>Institución que otorga la Beca</label>
                                <input value={institucionBeca} onChange={(e) => setInstitucionBeca(e.target.value)} className='form-input' type="text" placeholder="Institución que otorga la Beca" />
                            </div>

                            <div className="field-group full-width">
                                <label>Comentarios Académicos</label>
                                <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} className='form-input form-textarea' placeholder="Comentarios Académicos" rows="3"/>
                            </div>

                            <div className="field-group full-width">
                                <label htmlFor="adjunto">Adjunto de Notas</label>
                                <input id="adjunto"type="file" onChange={handleFileChange} ref={fileInputRef} className="file-input"/>
                                {adjuntoNotas && (
                                    <div className="file-preview">
                                        <a href={adjuntoNotas} target="_blank" rel="noopener noreferrer">Ver archivo adjunto</a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Datos Personales */}
                    <div className="form-section">
                        <div className="section-header">
                            <h3>Datos Personales</h3>
                        </div>
                        <div className="form-grid">
                            <div className="field-group">
                                <label>Fecha de Nacimiento *</label>
                                <input className='form-input' type="date" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)}  required />
                            </div>

                            <div className="field-group">
                                <label>Edad</label>
                                <input value={edad} onChange={(e) => setEdad(e.target.value)} className='form-input' type="text" placeholder="Edad" />
                            </div>

                            <div className="field-group">
                                <label>Cédula *</label>
                                <input value={cedula} onChange={(e) => setCedula(e.target.value)} className='form-input' type="number" placeholder="Cédula"  required/>
                            </div>

                            <div className="field-group">
                                <label>Teléfono Principal *</label>
                                <input value={telefono1} onChange={(e) => setTelefono1(e.target.value)} className='form-input' type="text" placeholder="Teléfono Principal"  required/>
                            </div>

                            <div className="field-group">
                                <label>Teléfono Secundario</label>
                                <input value={telefono2} onChange={(e) => setTelefono2(e.target.value)} className='form-input' type="text" placeholder="Teléfono Secundario" />
                            </div>

                            <div className="field-group full-width">
                                <label>Lugar de Residencia</label>
                                <textarea value={lugarResidencia} onChange={(e) => setLugarResidencia(e.target.value)} className='form-input form-textarea' placeholder="Lugar de Residencia" rows="2"/>
                            </div>
                        </div>
                    </div>

                    {/* Datos Técnicos/Médicos */}
                    <div className="form-section">
                        <div className="section-header">
                            <h3>Información Médica</h3>
                        </div>
                        <div className="form-grid">
                            <div className="field-group">
                                <label>Lesiones</label>
                                <textarea value={lesiones} onChange={(e) => setLesiones(e.target.value)} className='form-input form-textarea' placeholder="Lesiones" rows="2"/>
                            </div>

                            <div className="field-group">
                                <label>Enfermedades</label>
                                <textarea value={enfermedades} onChange={(e) => setEnfermedades(e.target.value)} className='form-input form-textarea' placeholder="Enfermedades" rows="2" />
                            </div>

                            <div className="field-group">
                                <label>Tratamientos</label>
                                <textarea value={tratamientos} onChange={(e) => setTratamientos(e.target.value)} className='form-input form-textarea' placeholder="Tratamientos" rows="2" />
                            </div>

                            <div className="field-group">
                                <label>Atención Médica</label>
                                <textarea value={atencionMedica} onChange={(e) => setAtencionMedica(e.target.value)} className='form-input form-textarea' placeholder="Atención Médica" rows="2" />
                            </div>

                            <div className="field-group">
                                <label>Uso de Drogas/Medicamentos</label>
                                <textarea alue={drogas}onChange={(e) => setDrogas(e.target.value)} className='form-input form-textarea' placeholder="Uso de Drogas/Medicamentos" rows="2"/>
                            </div>

                            <div className="field-group">
                                <label>Disponibilidad</label>
                                <textarea value={disponibilidad} onChange={(e) => setDisponibilidad(e.target.value)} className='form-input form-textarea' placeholder="Disponibilidad" rows="2"/>
                            </div>
                        </div>
                    </div>

                    {/* Vivienda */}
                    <div className="form-section">
                        <div className="section-header">
                            <h3>Información de Vivienda</h3>
                        </div>
                        <div className="form-grid">
                            <div className="field-group">
                                <label>Tipo de Casa</label>
                                <input value={casa} onChange={(e) => setCasa(e.target.value)} className='form-input' type="text" placeholder="Tipo de Casa" />
                            </div>

                            <div className="field-group">
                                <label>Monto de Casa/Alquiler</label>
                                <input value={montoCasa} onChange={(e) => setMontoCasa(e.target.value)} className='form-input' type="number" placeholder="Monto de Casa/Alquiler" />
                            </div>

                            <div className="field-group full-width">
                                <label>Especificaciones de la Vivienda</label>
                                <textarea value={especificaciones} onChange={(e) => setEspecificaciones(e.target.value)} className='form-input form-textarea' placeholder="Especificaciones de la Vivienda" rows="3"/>
                            </div>

                            <div className="field-group full-width">
                                <label>Comentarios sobre Vivienda</label>
                                <textarea value={comentario4} onChange={(e) => setComentario4(e.target.value)} className='form-input form-textarea' placeholder="Comentarios sobre Vivienda"  rows="2"/>
                            </div>
                        </div>
                    </div>

                    {/* Trabajo */}
                    <div className="form-section">
                        <div className="section-header">
                            <h3>Información Laboral</h3>
                        </div>
                        <div className="form-grid">
                            <div className="field-group">
                                <label>¿Trabaja actualmente?</label>
                                <select className='form-input' value={trabaja} onChange={(e) => setTrabaja(e.target.value)}>
                                    <option value="">Seleccionar</option>
                                    <option value="si">Sí</option>
                                    <option value="no">No</option>
                                </select>
                            </div>

                            <div className="field-group">
                                <label>Empresa/Lugar de Trabajo</label>
                                <input  value={empresa} onChange={(e) => setEmpresa(e.target.value)} className='form-input' type="text" placeholder="Empresa/Lugar de Trabajo" />
                            </div>

                            <div className="field-group">
                                <label>Salario</label>
                                <input value={salario} onChange={(e) => setSalario(e.target.value)} className='form-input' type="number" placeholder="Salario" />
                            </div>

                            <div className="field-group full-width">
                                <label>Comentarios sobre Trabajo</label>
                                <textarea value={comentario5} onChange={(e) => setComentario5(e.target.value)} className='form-input form-textarea' placeholder="Comentarios sobre Trabajo" rows="2"/>
                            </div>
                        </div>
                    </div>

                    {/* Información Familiar */}
                    <div className="form-section">
                        <div className="section-header">
                            <h3>Información Familiar</h3>
                        </div>
                        <div className="form-grid">
                            <div className="field-group">
                                <label>Nombre del Familiar</label>
                                <input value={nombreFamiliar} onChange={(e) => setNombreFamiliar(e.target.value)} className='form-input' type="text" placeholder="Nombre del Familiar" />
                            </div>

                            <div className="field-group">
                                <label>Edad del Familiar</label>
                                <input value={edadFamiliar} onChange={(e) => setEdadFamiliar(e.target.value)} className='form-input' type="text" placeholder="Edad del Familiar" />
                            </div>

                            <div className="field-group">
                                <label>Parentesco</label>
                                <input value={parentesco}onChange={(e) => setParentesco(e.target.value)} className='form-input' type="text" placeholder="Parentesco" />
                            </div>

                            <div className="field-group">
                                <label>Ingreso Mensual del Familiar</label>
                                <input value={ingresoMensual} onChange={(e) => setIngresoMensual(e.target.value)} className='form-input' type="number" placeholder="Ingreso Mensual del Familiar" />
                            </div>

                            <div className="field-group full-width">
                                <label>Ocupación del Familiar</label>
                                <textarea value={ocupacion} onChange={(e) => setOcupacion(e.target.value)} className='form-input form-textarea' placeholder="Ocupación del Familiar" rows="2"/>
                            </div>

                            <div className="field-group full-width">
                                <label>Lugar de Trabajo del Familiar</label>
                                <textarea value={lugarTrabajo} onChange={(e) => setLugarTrabajo(e.target.value)} className='form-input form-textarea' placeholder="Lugar de Trabajo del Familiar" rows="2"/>
                            </div>
                        </div>
                    </div>

                    {/* Ingresos y Gastos */}
                    <div className="form-section">
                        <div className="section-header">
                            <h3>Ingresos Familiares</h3>
                        </div>
                        <div className="form-grid">
                            <div className="field-group">
                                <label>Ingresos Totales</label>
                                <input value={ingresos} onChange={(e) => setIngresos(e.target.value)} className='form-input' type="number" placeholder="Ingresos Totales" />
                            </div>

                            <div className="field-group">
                                <label>Salario Adicional</label>
                                <input value={salario2} onChange={(e) => setSalario2(e.target.value)} className='form-input' type="number" placeholder="Salario Adicional" />
                            </div>

                            <div className="field-group">
                                <label>Pensión</label>
                                <input value={pension} onChange={(e) => setPension(e.target.value)} className='form-input' type="number" placeholder="Pensión" />
                            </div>

                            <div className="field-group">
                                <label>Beca (Ingreso)</label>
                                <input value={beca2} onChange={(e) => setBeca2(e.target.value)} className='form-input' type="number" placeholder="Beca (Ingreso)" />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <div className="section-header">
                            <h3>Gastos Familiares</h3>
                        </div>
                        <div className="form-grid">
                            <div className="field-group">
                                <label>Gastos Totales</label>
                                <input value={gastos}onChange={(e) => setGastos(e.target.value)} className='form-input' type="number" placeholder="Gastos Totales" />
                            </div>

                            <div className="field-group">
                                <label>Gastos en Comida</label>
                                <input value={comida} onChange={(e) => setComida(e.target.value)} className='form-input' type="number" placeholder="Gastos en Comida" />
                            </div>

                            <div className="field-group">
                                <label>Gastos en Agua</label>
                                <input value={agua} onChange={(e) => setAgua(e.target.value)} className='form-input' type="number" placeholder="Gastos en Agua" />
                            </div>

                            <div className="field-group">
                                <label>Gastos en Electricidad</label>
                                <input value={luz} onChange={(e) => setLuz(e.target.value)} className='form-input' type="number" placeholder="Gastos en Electricidad" />
                            </div>

                            <div className="field-group">
                                <label>Internet y Cable</label>
                                <input value={internetCable} onChange={(e) => setInternetCable(e.target.value)} className='form-input' type="number" placeholder="Internet y Cable" />
                            </div>

                            <div className="field-group">
                                <label>Gastos en Celular</label>
                                <input  value={celular} onChange={(e) => setCelular(e.target.value)} className='form-input' type="number" placeholder="Gastos en Celular" />
                            </div>

                            <div className="field-group">
                                <label>Viáticos</label>
                                <input value={viaticos} onChange={(e) => setViaticos(e.target.value)}  className='form-input' type="number" placeholder="Viáticos" />
                            </div>

                            <div className="field-group">
                                <label>Gastos en Salud</label>
                                <input value={salud} onChange={(e) => setSalud(e.target.value)} className='form-input' type="number" placeholder="Gastos en Salud" />
                            </div>

                            <div className="field-group">
                                <label>Deudas</label>
                                <input value={deudas}onChange={(e) => setDeudas(e.target.value)} className='form-input' type="number" placeholder="Deudas" />
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-primary" disabled={isLoading}>
                            {editMode ? 'Actualizar Visita' : 'Crear Visita'}
                        </button>

                        {editMode && (
                            <button type="button" className="btn-secondary" onClick={limpiarFormulario}>Cancelar</button>
                        )}
                    </div>
                    
                    {isLoading && (
                        <div className="loading-container">
                            <div className="spinner"> <span></span> <span></span> <span></span> <span></span> <span></span> <span></span>
                            </div>
                        </div>
                    )}
                    
                    {error && <div className="error-message">{error}</div>}
                </form>
            </div>

            {/* Lista de Visitas */}
            <div className="table-container">
                <div className="table-header">
                    <h3>Lista de Visitas</h3>
                </div>
                <div className="table-wrapper">
                    <table className="visitas-table">
                        <thead>
                            <tr>
                                <th>Expediente</th> <th>Nombre</th> <th>Rol</th> <th>Institución</th> <th>Fecha Nacimiento</th> <th>Cédula</th> <th>Teléfono</th> <th>Fecha Visita</th> <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visitas && visitas.length > 0 && visitas.map((visita) => (
                                <tr key={`visita-${visita.id}`}>
                                    <td>{obtenerNombreExpediente(visita.expediente)}</td> <td>{visita.nombreCompleto}</td> <td>{visita.rol}</td> <td>{visita.institucion}</td> <td>{visita.fechaNacimiento}</td> <td>{visita.cedula}</td> <td>{visita.telefono1}</td> <td>{visita.fechaVisita ? new Date(visita.fechaVisita).toLocaleDateString() : 'N/A'}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-edit" onClick={() => editarVisita(visita)}> Editar </button>
                                            <button className="btn-delete" onClick={() => eliminarVisita(visita.id)}> Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {visitas && visitas.length === 0 && (
                    <div className="no-data">No hay visitas registradas.</div>
                )}
            </div>
        </div>
    )
}

export default Visita