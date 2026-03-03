import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import CartPage from './pages/CartPage';
import InfrastructurePanel from './pages/InfrastructurePanel';
import SecurityPanel from './pages/SecurityPanel';
import CertificatesPanel from './pages/CertificatesPanel';
import SystemStatus from './pages/SystemStatus';
import './App.css';

export default function App() {
  return (
    <Router>
      <nav className="main-nav">
        <Link to="/">Inicio</Link>
        <Link to="/cart">Bolsa</Link>
        <Link to="/infrastructure">Infraestructura</Link>
        <Link to="/security">Seguridad</Link>
        <Link to="/certificates">Certificados</Link>
        <Link to="/status">Estado del Sistema</Link>
      </nav>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/infrastructure" element={<InfrastructurePanel />} />
          <Route path="/security" element={<SecurityPanel />} />
          <Route path="/certificates" element={<CertificatesPanel />} />
          <Route path="/status" element={<SystemStatus />} />
        </Routes>
      </div>
    </Router>
  );
}
