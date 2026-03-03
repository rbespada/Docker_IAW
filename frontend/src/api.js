import axios from 'axios';

const API_URL = 'http://localhost:4000';

const api = axios.create({ baseURL: API_URL });

export const getProducts = () => api.get('/products');
export const addProduct = (data) => api.post('/products', data);
export const getCart = () => api.get('/cart');
export const addToCart = (data) => api.post('/cart', data);
export const loginUser = (data) => api.post('/login', data);
export const registerUser = (data) => api.post('/users', data);

// additional endpoints for administration panels
export const getSystemStatus = () => api.get('/stats');
export const getSecurityInfo = () => api.get('/security');
export const getCertificates = () => api.get('/certificates');

export default api;
