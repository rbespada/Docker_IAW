import React from 'react';

export default function InfrastructurePanel() {
  return (
    <div className="infra-panel">
      <h2>Panel de Control de Infraestructura</h2>
      <p>Arquitectura cliente-servidor con Nginx como proxy inverso y balanceador de carga.</p>
      <pre className="diagram">
{`Browser --> Nginx (Load Balancer) --> API Gateway --> Microservices
                                  \--> Strapi CMS
                                  \--> PostgreSQL`}
      </pre>
      <section className="health-status">
        <h3>Estados de Salud</h3>
        <ul>
          <li>Servidor: <span className="status good">OK</span></li>
          <li>Base de datos: <span className="status good">Connected</span></li>
        </ul>
      </section>
    </div>
  );
}
