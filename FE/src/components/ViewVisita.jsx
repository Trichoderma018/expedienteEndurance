import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Llamados from '../services/Llamados';
import '../style/ViewVisita.css';

function ViewVisita() {
    const [visita, setVisita] = useState(null);
    const [expediente, setExpediente] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        cargarVisita();
    }, []);

    const cargarVisita = async () => {
        const visitaId = localStorage.getItem('visitaId');

        if (!visitaId) {
            setError('No se encontró el ID de la visita');
            setIsLoading(false);
            return;
        }

        try {
            // Obtener datos de la visita
            const visitaData = await Llamados.getData(`api/visitas/${visitaId}/`);
            setVisita(visitaData);

            // Obtener datos del expediente asociado
            if (visitaData.expediente) {
                const expedienteData = await Llamados.getData(`api/expedientes/${visitaData.expediente}/`);
                setExpediente(expedienteData);
            }

        } catch (error) {
            console.error('Error cargando visita:', error);
            setError('Error al cargar la información de la visita');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVolver = () => {
        localStorage.removeItem('visitaId');
        navigate('/views');
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return 'No disponible';
        try {
            return new Date(fecha).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return 'Fecha no válida';
        }
    };

    const formatearMoneda = (valor) => {
        if (valor === null || valor === undefined || valor === '') {
            return 'No disponible';
        }

        const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
            if (isNaN(numero)) {
            return 'No disponible';
        }

        // Formateo con comas
        const numeroFormateado = numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return `CRC ${numeroFormateado}`;
    };

    const generarPDF = () => {
        const doc = new jsPDF();
        let yPosition = 20;
        const pageHeight = 280; // Altura útil de la página
        const margin = 14;

        // Función helper para verificar si necesitamos nueva página
        const checkNewPage = (requiredSpace = 20) => {
            if (yPosition + requiredSpace > pageHeight) {
                doc.addPage();
                yPosition = 20;
            }
        };

        // Función helper para añadir sección con título
        const addSectionTitle = (title) => {
            checkNewPage(25);
            doc.setFontSize(16);
            doc.setTextColor(52, 73, 94);
            doc.text(title, margin, yPosition);
            yPosition += 15;
        };

        // Función helper para añadir item de detalle
        const addDetailItem = (label, value, isLongText = false) => {
            checkNewPage(isLongText ? 15 : 8);
            doc.setFont(undefined, 'bold');
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            doc.text(label, margin, yPosition);
            doc.setFont(undefined, 'normal');

            if (isLongText) {
                yPosition += 7;
                const lines = doc.splitTextToSize(value, 180);
                lines.forEach(line => {
                    checkNewPage(6);
                    doc.text(line, margin, yPosition);
                    yPosition += 5;
                });
                yPosition += 3;
            } else {
                doc.text(value, 60, yPosition);
                yPosition += 7;
            }
        };

        // TÍTULO PRINCIPAL
        doc.setFontSize(20);
        doc.setTextColor(44, 62, 80);
        doc.text(`Detalle de Visita #${visita.id}`, 105, yPosition, { align: 'center' });
        yPosition += 25;

        // INFORMACIÓN BÁSICA
        addSectionTitle('Información Básica');

        const infoBasica = [
            ['Nombre Completo:', visita.nombreCompleto || 'No disponible'],
            ['Rol:', visita.rol || 'No disponible'],
            ['Fecha de Visita:', formatearFecha(visita.fechaVisita || visita.created_at)]
        ];

        infoBasica.forEach(([label, value]) => {
            addDetailItem(label, value);
        });
        yPosition += 10;

        // INFORMACIÓN ACADÉMICA
        addSectionTitle('Información Académica');

        const infoAcademica = [
            ['Institución:', visita.institucion || 'No disponible'],
            ['Año Académico:', visita.anoAcademico || 'No disponible'],
            ['Adecuación:', visita.adecuacion || 'No disponible'],
            ['Tipo de Adecuación:', visita.tipoAdecuacion || 'No disponible'],
            ['¿Tiene beca?:', visita.beca === 'si' ? 'Sí' : visita.beca === 'no' ? 'No' : 'No especificado'],
            ['Monto de Beca:', visita.montoBeca ? formatearMoneda(visita.montoBeca) : 'No disponible'],
            ['Institución que otorga:', visita.institucionBeca || 'No disponible']
        ];

        infoAcademica.forEach(([label, value]) => {
            addDetailItem(label, value);
        });

        // Comentarios académicos (texto largo)
        if (visita.comentario) {
            addDetailItem('Comentarios Académicos:', visita.comentario, true);
        }
        yPosition += 10;

        // DATOS PERSONALES
        addSectionTitle('Datos Personales');

        const datosPersonales = [
            ['Fecha de Nacimiento:', visita.fechaNacimiento ? formatearFecha(visita.fechaNacimiento) : 'No disponible'],
            ['Edad:', visita.edad || 'No disponible'],
            ['Cédula:', visita.cedula || 'No disponible'],
            ['Teléfono Principal:', visita.telefono1 || 'No disponible'],
            ['Teléfono Secundario:', visita.telefono2 || 'No disponible']
        ];

        datosPersonales.forEach(([label, value]) => {
            addDetailItem(label, value);
        });

        // Lugar de residencia (texto largo)
        if (visita.lugarResidencia) {
            addDetailItem('Lugar de Residencia:', visita.lugarResidencia, true);
        }
        yPosition += 10;

        // RESUMEN ECONÓMICO - Nueva página para asegurar que la tabla quepa completa
        doc.addPage();
        yPosition = 20;

        addSectionTitle('Resumen Económico');

        const economicData = [
            ['INGRESOS', ''],
            ['Ingresos Totales', formatearMoneda(visita.ingresos || 0)],
            ['Salario', formatearMoneda(visita.salario || 0)],
            ['Pensión', formatearMoneda(visita.pension || 0)],
            ['Beca', formatearMoneda(visita.beca2 || 0)],
            ['', ''],
            ['GASTOS', ''],
            ['Gastos Totales', formatearMoneda(visita.gastos || 0)],
            ['Comida', formatearMoneda(visita.comida || 0)],
            ['Agua', formatearMoneda(visita.agua || 0)],
            ['Luz', formatearMoneda(visita.luz || 0)],
            ['Internet/Cable', formatearMoneda(visita.internetCable || 0)],
            ['Celular', formatearMoneda(visita.celular || 0)],
            ['Transporte', formatearMoneda(visita.viaticos || 0)],
            ['Salud', formatearMoneda(visita.salud || 0)],
            ['Deudas', formatearMoneda(visita.deudas || 0)],
            ['', ''],
            ['BALANCE', formatearMoneda((visita.ingresos || 0) - (visita.gastos || 0))]
        ];

        autoTable(doc, {
            startY: yPosition,
            head: [],
            body: economicData,
            theme: 'grid',
            styles: {
                fontSize: 10,
                cellPadding: 3
            },
            columnStyles: {
                0: { cellWidth: 100 },
                1: { halign: 'right', cellWidth: 70 }
            },
            tableWidth: 'wrap',
            margin: { left: 14, right: 14 },
            didParseCell: function (data) {
                if (data.row.index === 0 || data.row.index === 6) {
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.fillColor = [240, 240, 240];
                }
                if (data.row.index === 17) {
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.fillColor = [220, 220, 220];
                }
            }
        });
        // Obtener la posición Y después de la tabla
        yPosition = doc.lastAutoTable.finalY + 20;

        // VIVIENDA
        addSectionTitle('Información de Vivienda');
        const vivienda = [
            ['Tipo de Casa:', visita.casa || 'No disponible'],
            ['Monto Casa/Alquiler:', visita.montoCasa ? formatearMoneda(visita.montoCasa) : 'No disponible']
        ];

        vivienda.forEach(([label, value]) => {
            addDetailItem(label, value);
        });

        // Especificaciones de vivienda (texto largo)
        if (visita.especificaciones) {
            addDetailItem('Especificaciones de Vivienda:', visita.especificaciones, true);
        }

        // Comentarios de vivienda (texto largo)
        if (visita.comentario4) {
            addDetailItem('Comentarios sobre Vivienda:', visita.comentario4, true);
        }
        yPosition += 10;

        // TRABAJO
        addSectionTitle('Información Laboral');

        const trabajo = [
            ['¿Trabaja actualmente?:', visita.trabaja === 'si' ? 'Sí' : visita.trabaja === 'no' ? 'No' : 'No especificado'],
            ['Empresa:', visita.empresa || 'No disponible'],
            ['Salario:', visita.salario ? formatearMoneda(visita.salario) : 'No disponible']
        ];

        trabajo.forEach(([label, value]) => {
            addDetailItem(label, value);
        });

        // Comentarios sobre trabajo (texto largo)
        if (visita.comentario5) {
            addDetailItem('Comentarios sobre Trabajo:', visita.comentario5, true);
        }
        yPosition += 10;

        // INFORMACIÓN MÉDICA - Nueva página si hay contenido médico
        if (visita.lesiones || visita.enfermedades || visita.tratamientos || visita.atencionMedica || visita.drogas || visita.disponibilidad) {
            // Verificar si necesitamos nueva página para la sección médica
            checkNewPage(50);

            addSectionTitle('Información Médica');

            const infoMedica = [
                ['Lesiones:', visita.lesiones || 'No disponible'],
                ['Enfermedades:', visita.enfermedades || 'No disponible'],
                ['Tratamientos:', visita.tratamientos || 'No disponible'],
                ['Atención Médica:', visita.atencionMedica || 'No disponible'],
                ['Drogas/Medicamentos:', visita.drogas || 'No disponible'],
                ['Disponibilidad:', visita.disponibilidad || 'No disponible']
            ];

            infoMedica.forEach(([label, value]) => {
                if (value && value !== 'No disponible' && value.length > 50) {
                    addDetailItem(label, value, true);
                } else {
                    addDetailItem(label, value);
                }
            });
            yPosition += 10;
        }

        // INFORMACIÓN FAMILIAR - Nueva página si hay contenido familiar
        if (visita.nombreFamiliar || visita.parentesco) {
            // Verificar si necesitamos nueva página para la sección familiar
            checkNewPage(50);

            addSectionTitle('Información Familiar');

            const infoFamiliar = [
                ['Nombre del Familiar:', visita.nombreFamiliar || 'No disponible'],
                ['Edad del Familiar:', visita.edadFamiliar || 'No disponible'],
                ['Parentesco:', visita.parentesco || 'No disponible'],
                ['Ingreso Mensual:', visita.ingresoMensual ? formatearMoneda(visita.ingresoMensual) : 'No disponible'],
                ['Ocupación:', visita.ocupacion || 'No disponible'],
                ['Lugar de Trabajo:', visita.lugarTrabajo || 'No disponible']
            ];

            infoFamiliar.forEach(([label, value]) => {
                addDetailItem(label, value);
            });
        }

        // PIE DE PÁGINA
        // Ir a la última página para añadir el pie de página
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(9);
            doc.setTextColor(128, 128, 128);
            doc.text(`Página ${i} de ${totalPages}`, 105, 285, { align: 'center' });
            doc.text(`Documento generado el ${new Date().toLocaleDateString('es-ES')}`, 105, 290, { align: 'center' });
        }

        // Guardar el PDF
        doc.save(`Visita_${visita.id}_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    if (isLoading) {
        return (
            <div className="view-visita-container">
                <div className="loading">Cargando información de la visita...</div>
            </div>
        );
    }
    if (error && !visita) {
        return (
            <div className="view-visita-container">
                <div className="error">{error}</div>
                <button onClick={handleVolver} className="btn-volver">Volver</button>
            </div>
        );
    }
    if (!visita) {
        return (
            <div className="view-visita-container">
                <div className="error">No se encontró la visita</div>
                <button onClick={handleVolver} className="btn-volver">Volver</button>
            </div>
        );
    }
    return (
        <div className='view-visita-master'>
            <div className="view-visita-container">
                <div className="view-header">
                    <button onClick={handleVolver} className="btn-volver">← Volver</button>
                    <h1>Detalle de Visita #{visita.id}</h1>
                    <div className="header-actions">
                        <button onClick={generarPDF} className="btn-descargar-pdf">
                            📄 Descargar PDF
                        </button>
                    </div>
                </div>

                <div className="visita-details">
                    {/* Información Básica */}
                    <div className="detail-section">
                        <h2>Información Básica</h2>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <label>Nombre Completo:</label>
                                <span>{visita.nombreCompleto || 'No disponible'}</span>
                            </div>
                            <div className="detail-item">
                                <label>Rol:</label>
                                <span>{visita.rol || 'No disponible'}</span>
                            </div>
                            <div className="detail-item">
                                <label>Fecha de Visita:</label>
                                <span>{formatearFecha(visita.fechaVisita || visita.created_at)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Información Académica */}
                    <div className="detail-section">
                        <h2>Información Académica</h2>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <label>Institución:</label>
                                <span>{visita.institucion || 'No disponible'}</span>
                            </div>
                            <div className="detail-item">
                                <label>Año Académico:</label>
                                <span>{visita.anoAcademico || 'No disponible'}</span>
                            </div>
                            <div className="detail-item">
                                <label>Adecuación:</label>
                                <span>{visita.adecuacion || 'No disponible'}</span>
                            </div>
                            <div className="detail-item">
                                <label>Tipo de Adecuación:</label>
                                <span>{visita.tipoAdecuacion || 'No disponible'}</span>
                            </div>
                            <div className="detail-item">
                                <label>¿Tiene beca?:</label>
                                <span>{visita.beca === 'si' ? 'Sí' : visita.beca === 'no' ? 'No' : 'No especificado'}</span>
                            </div>
                            <div className="detail-item">
                                <label>Monto de Beca:</label>
                                <span>{visita.montoBeca ? `₡${visita.montoBeca.toLocaleString()}` : 'No disponible'}</span>
                            </div>
                        </div>

                        <div className="detail-item full-width">
                            <label>Institución que otorga la Beca:</label>
                            <span>{visita.institucionBeca || 'No disponible'}</span>
                        </div>

                        <div className="detail-item full-width">
                            <label>Comentarios Académicos:</label>
                            <span>{visita.comentario || 'No disponible'}</span>
                        </div>

                        {visita.adjuntoNotas && (
                            <div className="detail-item full-width">
                                <label>Adjunto de Notas:</label>
                                <a href={visita.adjuntoNotas} target="_blank" rel="noopener noreferrer" className="file-link">
                                    Ver archivo adjunto
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Datos Personales */}
                    <div className="detail-section">
                        <h2>Datos Personales</h2>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <label>Fecha de Nacimiento:</label>
                                <span>{visita.fechaNacimiento ? formatearFecha(visita.fechaNacimiento) : 'No disponible'}</span>
                            </div>
                            <div className="detail-item">
                                <label>Edad:</label>
                                <span>{visita.edad || 'No disponible'}</span>
                            </div>
                            <div className="detail-item">
                                <label>Cédula:</label>
                                <span>{visita.cedula || 'No disponible'}</span>
                            </div>
                            <div className="detail-item">
                                <label>Teléfono Principal:</label>
                                <span>{visita.telefono1 || 'No disponible'}</span>
                            </div>
                            <div className="detail-item">
                                <label>Teléfono Secundario:</label>
                                <span>{visita.telefono2 || 'No disponible'}</span>
                            </div>
                            <div className="detail-item full-width">
                                <label>Lugar de Residencia:</label>
                                <span>{visita.lugarResidencia || 'No disponible'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Información Médica */}
                    {(visita.lesiones || visita.enfermedades || visita.tratamientos || visita.atencionMedica || visita.drogas || visita.disponibilidad) && (
                        <div className="detail-section">
                            <h2>Información Médica</h2>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>Lesiones:</label>
                                    <span>{visita.lesiones || 'No disponible'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Enfermedades:</label>
                                    <span>{visita.enfermedades || 'No disponible'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Tratamientos:</label>
                                    <span>{visita.tratamientos || 'No disponible'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Atención Médica:</label>
                                    <span>{visita.atencionMedica || 'No disponible'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Drogas/Medicamentos:</label>
                                    <span>{visita.drogas || 'No disponible'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Disponibilidad:</label>
                                    <span>{visita.disponibilidad || 'No disponible'}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Resumen Económico */}
                    <div className="detail-section">
                        <h2>Resumen Económico</h2>
                        <div className="economic-summary">
                            <div className="economic-block">
                                <h3>Ingresos</h3>
                                <div className="economic-grid">
                                    <div className="economic-item">
                                        <label>Ingresos Totales:</label>
                                        <span className="amount">{visita.ingresos ? `₡${visita.ingresos.toLocaleString()}` : '₡0'}</span>
                                    </div>
                                    <div className="economic-item">
                                        <label>Salario:</label>
                                        <span className="amount">{visita.salario ? `₡${visita.salario.toLocaleString()}` : '₡0'}</span>
                                    </div>
                                    <div className="economic-item">
                                        <label>Pensión:</label>
                                        <span className="amount">{visita.pension ? `₡${visita.pension.toLocaleString()}` : '₡0'}</span>
                                    </div>
                                    <div className="economic-item">
                                        <label>Beca:</label>
                                        <span className="amount">{visita.beca2 ? `₡${visita.beca2.toLocaleString()}` : '₡0'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="economic-block">
                                <h3>Gastos</h3>
                                <div className="economic-grid">
                                    <div className="economic-item">
                                        <label>Gastos Totales:</label>
                                        <span className="amount expense">{visita.gastos ? `₡${visita.gastos.toLocaleString()}` : '₡0'}</span>
                                    </div>
                                    <div className="economic-item">
                                        <label>Comida:</label>
                                        <span className="amount expense">{visita.comida ? `₡${visita.comida.toLocaleString()}` : '₡0'}</span>
                                    </div>
                                    <div className="economic-item">
                                        <label>Servicios (Agua, Luz):</label>
                                        <span className="amount expense">{((visita.agua || 0) + (visita.luz || 0)) ? `₡${((visita.agua || 0) + (visita.luz || 0)).toLocaleString()}` : '₡0'}</span>
                                    </div>
                                    <div className="economic-item">
                                        <label>Comunicaciones:</label>
                                        <span className="amount expense">{((visita.internetCable || 0) + (visita.celular || 0)) ? `₡${((visita.internetCable || 0) + (visita.celular || 0)).toLocaleString()}` : '₡0'}</span>
                                    </div>
                                    <div className="economic-item">
                                        <label>Transporte:</label>
                                        <span className="amount expense">{visita.viaticos ? `₡${visita.viaticos.toLocaleString()}` : '₡0'}</span>
                                    </div>
                                    <div className="economic-item">
                                        <label>Salud:</label>
                                        <span className="amount expense">{visita.salud ? `₡${visita.salud.toLocaleString()}` : '₡0'}</span>
                                    </div>
                                    <div className="economic-item">
                                        <label>Deudas:</label>
                                        <span className="amount expense">{visita.deudas ? `₡${visita.deudas.toLocaleString()}` : '₡0'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="economic-balance">
                                <div className="balance-item">
                                    <label>Balance:</label>
                                    <span className={`balance-amount ${(visita.ingresos || 0) - (visita.gastos || 0) >= 0 ? 'positive' : 'negative'}`}>
                                        ₡{((visita.ingresos || 0) - (visita.gastos || 0)).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Información de Vivienda */}
                    <div className="detail-section">
                        <h2>Información de Vivienda</h2>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <label>Tipo de Casa:</label>
                                <span>{visita.casa || 'No disponible'}</span>
                            </div>
                            <div className="detail-item">
                                <label>Monto Casa/Alquiler:</label>
                                <span>{visita.montoCasa ? `₡${visita.montoCasa.toLocaleString()}` : 'No disponible'}</span>
                            </div>
                            <div className="detail-item full-width">
                                <label>Especificaciones de Vivienda:</label>
                                <span>{visita.especificaciones || 'No disponible'}</span>
                            </div>
                            <div className="detail-item full-width">
                                <label>Comentarios sobre Vivienda:</label>
                                <span>{visita.comentario4 || 'No disponible'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Información Laboral */}
                    <div className="detail-section">
                        <h2>Información Laboral</h2>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <label>¿Trabaja actualmente?:</label>
                                <span>{visita.trabaja === 'si' ? 'Sí' : visita.trabaja === 'no' ? 'No' : 'No especificado'}</span>
                            </div>
                            <div className="detail-item">
                                <label>Empresa:</label>
                                <span>{visita.empresa || 'No disponible'}</span>
                            </div>
                            <div className="detail-item">
                                <label>Salario:</label>
                                <span>{visita.salario ? `₡${visita.salario.toLocaleString()}` : 'No disponible'}</span>
                            </div>
                            <div className="detail-item full-width">
                                <label>Comentarios sobre Trabajo:</label>
                                <span>{visita.comentario5 || 'No disponible'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Información Familiar */}
                    {(visita.nombreFamiliar || visita.parentesco) && (
                        <div className="detail-section">
                            <h2>Información Familiar</h2>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>Nombre del Familiar:</label>
                                    <span>{visita.nombreFamiliar || 'No disponible'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Edad del Familiar:</label>
                                    <span>{visita.edadFamiliar || 'No disponible'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Parentesco:</label>
                                    <span>{visita.parentesco || 'No disponible'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Ingreso Mensual del Familiar:</label>
                                    <span>{visita.ingresoMensual ? `₡${visita.ingresoMensual.toLocaleString()}` : 'No disponible'}</span>
                                </div>
                                <div className="detail-item full-width">
                                    <label>Ocupación del Familiar:</label>
                                    <span>{visita.ocupacion || 'No disponible'}</span>
                                </div>
                                <div className="detail-item full-width">
                                    <label>Lugar de Trabajo del Familiar:</label>
                                    <span>{visita.lugarTrabajo || 'No disponible'}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
export default ViewVisita;