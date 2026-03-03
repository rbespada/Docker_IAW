require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use(express.json());

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'gateway' });
});

// simple static endpoints for admin panels
app.get('/stats', (req, res) => {
  res.json({
    cpu: 23,
    memory: 57,
    bandwidth: 42,
    disk: 68,
    uptime: 123456,
    services: { nginx: 'running', mysql: 'running', php: 'running' }
  });
});

app.get('/security', (req, res) => {
  res.json({
    score: 85,
    firewall: { '80': 'open', '443': 'open' },
    ssl: { status: 'valid', expiry: '2025-01-01' },
    events: [
      { timestamp: new Date().toISOString(), desc: 'Intento de login fallido' }
    ]
  });
});

app.get('/certificates', (req, res) => {
  res.json({
    certs: [
      { name: "letsencrypt-prod", expires: "2024-06-01", status: "valid" },
      { name: "wildcard-site", expires: "2025-02-15", status: "renewal due" }
    ]
  });
});

// Proxies to microservices
app.use('/products', createProxyMiddleware({ 
  target: 'http://product:4001', 
  changeOrigin: true,
  pathRewrite: { '^/products': '' }
}));

app.use('/cart', createProxyMiddleware({ 
  target: 'http://cart:4002', 
  changeOrigin: true,
  pathRewrite: { '^/cart': '' }
}));

app.use('/users', createProxyMiddleware({ 
  target: 'http://user:4003', 
  changeOrigin: true,
  pathRewrite: { '^/users': '' }
}));

app.use('/login', createProxyMiddleware({ 
  target: 'http://user:4003', 
  changeOrigin: true
}));

// CMS (Strapi) proxy
app.use('/cms', createProxyMiddleware({ 
  target: 'http://cms:1337', 
  changeOrigin: true,
  pathRewrite: { '^/cms': '' }
}));

// Orders proxy
app.use('/orders', createProxyMiddleware({ 
  target: 'http://orders:4004', 
  changeOrigin: true,
  pathRewrite: { '^/orders': '' }
}));

app.listen(process.env.PORT || 4000, () => {
  console.log('Gateway running on port', process.env.PORT || 4000);
  console.log('Routes: /products, /cart, /users, /login, /cms, /orders');
});
