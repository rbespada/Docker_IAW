import React, { useEffect, useState } from 'react';
import { getSystemStatus } from '../api';

export default function SystemStatus() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getSystemStatus();
        setStatus(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetch();
    const iv = setInterval(fetch, 5000);
    return () => clearInterval(iv);
  }, []);

  if (!status) return <div className="loading">Cargando estado del sistema...</div>;

  return (
    <div className="status-panel dark">
      <h2>Estado del Sistema en Tiempo Real</h2>
      <div className="metrics">
        <p>CPU: {status.cpu}%</p>
        <p>Memoria: {status.memory}%</p>
        <p>Ancho banda: {status.bandwidth}%</p>
        <p>Disco: {status.disk}%</p>
        <p>Uptime: {status.uptime} secs</p>
      </div>
      <div className="services">
        <h3>Servicios</h3>
        <ul>
          {Object.entries(status.services).map(([name, st]) => (
            <li key={name}>{name}: {st}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
