require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Proxies to microservices
app.use('/products', createProxyMiddleware({ target: 'http://product:4001', changeOrigin: true }));
app.use('/cart', createProxyMiddleware({ target: 'http://cart:4002', changeOrigin: true }));
app.use('/users', createProxyMiddleware({ target: 'http://user:4003', changeOrigin: true }));
app.use('/login', createProxyMiddleware({ target: 'http://user:4003', changeOrigin: true }));

app.listen(process.env.PORT || 4000, () => {
  console.log('Gateway running on port', process.env.PORT || 4000);
});
