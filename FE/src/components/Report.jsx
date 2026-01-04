// src/Report.jsx
import React, { useEffect, useRef, useState } from "react";
import Chart from "react-apexcharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Llamados from '../services/Llamados';
import "../style/report.css";


export default function Report() {
  const [genero, setGenero] = useState([]);
  const [sede, setSede] = useState([]);
  const [beca, setBeca] = useState([]);
  const [edad, setEdad] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const reportRef = useRef();

  // Datos de ejemplo como fallback
  const datosEjemplo = {
    genero: [
      { genero: "Masculino", total: 45 },
      { genero: "Femenino", total: 55 }
    ],
    sede: [
      { sede: "Central", total: 60 },
      { sede: "Norte", total: 40 }
    ],
    beca: [
      { beca: "Completa", total: 30 },
      { beca: "Parcial", total: 50 },
      { beca: "Sin beca", total: 20 }
    ],
    edad: [
      { edad: "18-22", total: 40 },
      { edad: "23-27", total: 35 },
      { edad: "28+", total: 25 }
    ]
  };

  // Función para validar estructura de datos
  const validarDatos = (data, tipo) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return false;
    }
    
    // Verificar que cada objeto tenga las propiedades esperadas
    return data.every(item => {
      switch(tipo) {
        case 'genero':
          return item.hasOwnProperty('genero') && item.hasOwnProperty('total');
        case 'sede':
          return item.hasOwnProperty('sede') && item.hasOwnProperty('total');
        case 'beca':
          return item.hasOwnProperty('beca') && item.hasOwnProperty('total');
        case 'edad':
          return item.hasOwnProperty('edad') && item.hasOwnProperty('total');
        default:
          return false;
      }
    });
  };

  // Función para cargar datos de ejemplo
  const cargarDatosEjemplo = (mensaje = "Cargando datos de ejemplo") => {
    console.log(mensaje);
    setGenero(datosEjemplo.genero);
    setSede(datosEjemplo.sede);
    setBeca(datosEjemplo.beca);
    setEdad(datosEjemplo.edad);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Intentando conectar al servidor...");
        
        // Usar solo Llamados.getData, no hacer fetch doble
        const data = await Llamados.getData("api/expedientes/");
        
        console.log("Datos recibidos:", data);
        
        // Validar y asignar datos
        let datosValidos = true;
        
        if (validarDatos(data.genero, 'genero')) {
          setGenero(data.genero);
        } else {
          console.warn("Datos de género inválidos:", data.genero);
          setGenero(datosEjemplo.genero);
          datosValidos = false;
        }
        
        if (validarDatos(data.sede, 'sede')) {
          setSede(data.sede);
        } else {
          console.warn("Datos de sede inválidos:", data.sede);
          setSede(datosEjemplo.sede);
          datosValidos = false;
        }
        
        if (validarDatos(data.beca, 'beca')) {
          setBeca(data.beca);
        } else {
          console.warn("Datos de beca inválidos:", data.beca);
          setBeca(datosEjemplo.beca);
          datosValidos = false;
        }
        
        if (validarDatos(data.edad, 'edad')) {
          setEdad(data.edad);
        } else {
          console.warn("Datos de edad inválidos:", data.edad);
          setEdad(datosEjemplo.edad);
          datosValidos = false;
        }
        
        if (!datosValidos) {
          setError("Algunos datos del servidor tienen formato incorrecto. Mostrando datos de ejemplo.");
        }
        
      } catch (err) {
        console.error("Error cargando datos:", err);
        
        let mensajeError = "Error desconocido";
        
        if (err.message.includes('Failed to fetch') || 
            err.message.includes('ERR_CONNECTION_REFUSED') ||
            err.message.includes('Network Error') ||
            err.name === 'TypeError') {
          mensajeError = "No se puede conectar al servidor. Verifica que el backend esté corriendo en http://127.0.0.1:8000";
        } else if (err.message.includes('404')) {
          mensajeError = "El endpoint api/expedientes/ no fue encontrado en el servidor";
        } else if (err.message.includes('500')) {
          mensajeError = "Error interno del servidor";
        } else {
          mensajeError = `Error al cargar los datos: ${err.message}`;
        }
        
        setError(mensajeError);
        cargarDatosEjemplo("Error de conexión, cargando datos de ejemplo");
        
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  const downloadPDF = async () => {
    try {
      const input = reportRef.current;
      if (!input) {
        throw new Error("No se encontró el elemento para exportar");
      }
      
      const canvas = await html2canvas(input, { 
        scale: 2,
        useCORS: true,
        allowTaint: true 
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      // Si la imagen es más alta que una página, ajustar
      if (pdfHeight > pdf.internal.pageSize.getHeight()) {
        const ratio = pdf.internal.pageSize.getHeight() / pdfHeight;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth * ratio, pdf.internal.pageSize.getHeight());
      } else {
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      }
      
      pdf.save("reporte_alumnos.pdf");
    } catch (err) {
      console.error("Error generando PDF:", err);
      alert(`Error al generar el PDF: ${err.message}`);
    }
  };

  // Función para armar tabla (mejorada)
  const Tabla = ({ data, label }) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return (
        <div className="tablecontainerGraficas">
          <h3>{label}</h3>
          <p>No hay datos disponibles para {label.toLowerCase()}</p>
        </div>
      );
    }

    return (
      <div className="tablecontainerGraficas">
        <h3>{label}</h3>
        <table
          border="1"
          cellPadding="6"
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th>{label}</th>
              <th>Total</th>
              <th>Porcentaje</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const totalGeneral = data.reduce((sum, item) => sum + (item.total || 0), 0);
              return data.map((r, i) => {
                const firstValue = Object.values(r)[0];
                const total = r.total || 0;
                const porcentaje = totalGeneral > 0 ? ((total / totalGeneral) * 100).toFixed(1) : 0;
                
                return (
                  <tr key={i}>
                    <td>{firstValue || 'Sin datos'}</td>
                    <td>{total}</td>
                    <td>{porcentaje}%</td>
                  </tr>
                );
              });
            })()}
          </tbody>
        </table>
      </div>
    );
  };

  // Función para crear gráfico con validación
  const CrearGrafico = ({ data, tipo, titulo }) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return <p>No hay datos de {titulo.toLowerCase()} disponibles</p>;
    }

    const tieneTotal = data.every(item => typeof item.total === 'number' && item.total >= 0);
    if (!tieneTotal) {
      return <p>Los datos de {titulo.toLowerCase()} no tienen formato válido</p>;
    }

    switch (tipo) {
      case 'pie':
        return (
          <Chart
            type="pie"
            options={{ 
              labels: data.map((x) => x.genero || x.beca || 'Sin datos'),
              responsive: [{
                breakpoint: 480,
                options: {
                  chart: { width: 200 },
                  legend: { position: 'bottom' }
                }
              }],
              legend: { position: 'bottom' }
            }}
            series={data.map((x) => x.total)}
            height={200}
          />
        );
      
      case 'donut':
        return (
          <Chart
            type="donut"
            options={{ 
              labels: data.map((x) => x.beca || 'Sin datos'),
              responsive: [{
                breakpoint: 480,
                options: {
                  chart: { width: 200 },
                  legend: { position: 'bottom' }
                } 
              }],
              legend: { position: 'bottom' }
            }}
            series={data.map((x) => x.total)}
            height={200}
          />
        );
      
      case 'bar':
        return (
          <Chart
            type="bar"
            options={{ 
              xaxis: { 
                categories: data.map((x) => x.sede || x.edad || 'Sin datos') 
              },
              plotOptions: { bar: { horizontal: false } },
              dataLabels: { enabled: true }
            }}
            series={[{ name: "Total", data: data.map((x) => x.total) }]}
            height={200}
          />
        );
      
      case 'line':
        return (
          <Chart
            type="line"
            options={{ 
              xaxis: { 
                categories: data.map((x) => x.edad || 'Sin datos') 
              },
              stroke: { curve: 'smooth' },
              markers: { size: 6 }
            }}
            series={[{ name: "Total", data: data.map((x) => x.total) }]}
            height={200}
          />
        );
      
      default:
        return <p>Tipo de gráfico no soportado</p>;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 16, textAlign: 'center' }}>
        <h1>Reporte de Alumnos</h1>
        <div style={{ margin: '20px 0' }}>
          <p style={{ marginTop: '10px' }}>Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="BodyGraficas">
      <h1>Reporte de Alumnos</h1>

      <div ref={reportRef} className="graficasConteiner">
        <div className="PorGenero">
          <h2>Distibución por género</h2>
          <CrearGrafico data={genero} tipo="pie" titulo="Género" />
          <Tabla data={genero} label="Género" />
        </div>

        <div className="PorSede">
          <CrearGrafico data={sede} tipo="bar" titulo="Sede" />
          <Tabla data={sede} label="Sede" />
        </div>

        <div className="PorBeca">
          <CrearGrafico data={beca} tipo="donut" titulo="Beca" />
          <Tabla data={beca} label="Beca" />
        </div>

        <div className="IMGG"></div>
        
        <div className="PorEdad">
          <CrearGrafico data={edad} tipo="line" titulo="Edad" />
          <Tabla data={edad} label="Edad" />
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <button 
          onClick={downloadPDF}
          className="Btn_Descargar"
        >
          📄 Exportar a PDF
        </button>
      </div>
      <br />
    </div>
  );
}