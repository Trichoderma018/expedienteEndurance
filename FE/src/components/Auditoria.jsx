import { useEffect, useState } from "react";

{/* Sin cambios */}

function Auditoria() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/audit/") // endpoint Django
      .then(res => res.json())
      .then(data => setLogs(data));
  }, []);

  return (
    <div>
      <h2>Historial de Cambios</h2>
      <table>
        <thead>
          <tr>
            <th>Tabla</th>
            <th>Acción</th>
            <th>ID Registro</th>
            <th>Viejo</th>
            <th>Nuevo</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id}>
              <td>{log.table_name}</td>
              <td>{log.action}</td>
              <td>{log.record_id}</td>
              <td>{JSON.stringify(log.old_data)}</td>
              <td>{JSON.stringify(log.new_data)}</td>
              <td>{new Date(log.changed_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Auditoria;
