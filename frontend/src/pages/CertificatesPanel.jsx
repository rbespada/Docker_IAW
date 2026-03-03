import React, { useEffect, useState } from 'react';
import { getCertificates } from '../api';

export default function CertificatesPanel() {
  const [certs, setCerts] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getCertificates();
        setCerts(res.data.certs);
      } catch (err) {
        console.error(err);
      }
    };
    fetch();
  }, []);

  return (
    <div className="certs-panel dark">
      <h2>Gestión de Certificados SSL/TLS</h2>
      <table>
        <thead>
          <tr>
            <th>Nombre</th><th>Expira</th><th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {certs.map((c,i) => (
            <tr key={i}>
              <td>{c.name}</td>
              <td>{c.expires}</td>
              <td>{c.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="generate">Generar CSR</button>
    </div>
  );
}
