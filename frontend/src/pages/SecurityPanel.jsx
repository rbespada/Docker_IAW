import React, { useEffect, useState } from 'react';
import { getSecurityInfo } from '../api';

export default function SecurityPanel() {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getSecurityInfo();
        setInfo(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetch();
  }, []);

  if (!info) return <div className="loading">Cargando información de seguridad...</div>;

  return (
    <div className="security-panel dark">
      <h2>Panel de Configuración de Seguridad</h2>
      <div className="sec-score">
        <p>Puntuación salud: <strong>{info.score}%</strong></p>
      </div>
      <div className="firewall-controls">
        <h3>Reglas de Firewall</h3>
        <label>
          Puerto 80
          <input type="checkbox" checked={info.firewall['80'] === 'open'} disabled />
        </label>
        <label>
          Puerto 443
          <input type="checkbox" checked={info.firewall['443'] === 'open'} disabled />
        </label>
      </div>
      <div className="ssl-status">
        <h3>Certificados SSL/TLS</h3>
        <p>Estado: {info.ssl.status}</p>
        <p>Expira: {info.ssl.expiry}</p>
      </div>
      <div className="event-log">
        <h3>Eventos recientes</h3>
        <ul>
          {info.events.map((e,i) => <li key={i}>{e.timestamp}: {e.desc}</li>)}
        </ul>
      </div>
    </div>
  );
}
