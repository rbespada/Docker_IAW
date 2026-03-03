# Arquitectura de Microservicios - WebStack

## Índice
1. [Introducción](#introducción)
2. [Diagrama de Arquitectura](#diagrama-de-arquitectura)
3. [Componentes Principales](#componentes-principales)
4. [Esquema de Base de Datos](#esquema-de-base-de-datos)
5. [API Endpoints](#api-endpoints)
6. [Flujo de Comunicación](#flujo-de-comunicación)
7. [Configuración de Docker Compose](#configuración-de-docker-compose)
8. [Despliegue y Ejecución](#despliegue-y-ejecución)
9. [Escalabilidad](#escalabilidad)
10. [Monitoreo y Salud de Servicios](#monitoreo-y-salud-de-servicios)

---

## Introducción

### Cambio Arquitectónico: Monolito a Microservicios

El proyecto WebStack ha evolucionado de una arquitectura monolítica tradicional hacia una arquitectura de **microservicios distribuidos**. Este cambio proporciona:

- **Escalabilidad independiente**: Cada servicio se escala según su carga particular
- **Independencia tecnológica**: Servicios pueden usar diferentes tecnologías si es necesario
- **Facilidad de mantenimiento**: Fallos en un servicio no derribar los demás
- **Desarrollo paralelo**: Equipos pueden trabajar simultáneamente en diferentes servicios
- **Despliegue independiente**: Cada servicio se actualiza sin afectar otros

### Stack Tecnológico de Microservicios

```
├── Frontend             | React 18 + Vite (Puerto 5173)
├── API Gateway          | Express.js (Puerto 4000)
├── Microservicios       | 3 servicios Node.js + PostgreSQL
│   ├── Product Service  | Puerto 4001
│   ├── Cart Service     | Puerto 4002
│   └── User Service     | Puerto 4003
├── Base de Datos        | PostgreSQL 15-Alpine
└── Orquestación         | Docker Compose
```

---

## Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENTE NAVEGADOR                            │
│                    (Puerto 5173 - Vite)                          │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    HTTP/HTTPS
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    REACT FRONTEND (SPA)                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  App.jsx: Componente principal con estado reactivo       │  │
│  │  api.js: Cliente Axios para conectar con Gateway         │  │
│  │  App.css: Estilos con gradientes y responsive design     │  │
│  │  main.jsx: Punto de entrada de React                     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Puerto: 5173 | Imagen: node:18-alpine (serve) | Build: Vite   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    http://localhost:4000
                           │
                           ▼
     ┌─────────────────────────────────────────────────────┐
     │         API GATEWAY - Punto de Entrada              │
     │  ┌──────────────────────────────────────────────┐   │
     │  │  http-proxy-middleware: Rutas a servicios    │   │
     │  │  /products  → http://product:4001            │   │
     │  │  /cart      → http://cart:4002               │   │
     │  │  /users     → http://user:4003               │   │
     │  │  /login     → http://user:4003               │   │
     │  └──────────────────────────────────────────────┘   │
     │                                                       │
     │  Puerto: 4000 | Express.js | Node 18-Alpine         │
     └────────────┬──────────────┬──────────────┬──────────┘
                  │              │              │
        ┌─────────▼──┐  ┌────────▼──┐  ┌──────▼─────┐
        │  PRODUCT   │  │   CART    │  │    USER    │
        │ SERVICE    │  │  SERVICE  │  │  SERVICE   │
        │ Puerto 4001│  │ Puerto 4002  │ Puerto 4003│
        └─────┬──────┘  └────┬──────┘  └──────┬─────┘
              │               │               │
              │    Conexión a base de datos (DATABASE_URL)
              │               │               │
              └───────────────┼───────────────┘
                              │
                              ▼
            ┌──────────────────────────────────┐
            │   PostgreSQL 15-Alpine           │
            │   Base de Datos Compartida        │
            │   ┌────────────────────────────┐ │
            │   │ productos                  │ │
            │   │ cart_items                 │ │
            │   │ usuarios                   │ │
            │   └────────────────────────────┘ │
            │   Puerto: 5432 (interno)         │
            │   Volumen: db_data               │
            └──────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     DOCKER COMPOSE                               │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Red: webstack_network (Bridge)                          │  │
│  │  Descubrimiento de servicios por nombre de contenedor    │  │
│  │  Orquestación y gestión de dependencias                  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Componentes Principales

### 1. Frontend (React + Vite)
**Ubicación:** `/frontend`  
**Puerto:** 5173  
**Responsabilidades:**
- Interfaz de usuario reactiva
- Gestión del estado con hooks (useState, useEffect)
- Comunicación con API Gateway vía Axios
- Renderizado dinámico de productos y carrito

**Estructura de directorios:**
```
frontend/
├── package.json              # Dependencias: React, Vite, Axios
├── Dockerfile               # Build multi-etapa para producción
├── src/
│   ├── main.jsx            # Punto de entrada React
│   ├── App.jsx             # Componente principal
│   ├── App.css             # Estilos (gradientes, responsive)
│   └── api.js              # Cliente Axios para gateway
```

**Archivo principal - App.jsx:**
```jsx
import { useState, useEffect } from 'react';
import { getProducts, addToCart } from './api';
import './App.css';

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts();
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = async (productId) => {
    try {
      await addToCart(productId, 1);
      alert('Producto añadido al carrito');
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <div className="container">
      <h1>Tienda Online - WebStack</h1>
      {loading ? (
        <p>Cargando productos...</p>
      ) : (
        <div className="products-grid">
          {products.map(product => (
            <div key={product.id} className="product-card">
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <p className="price">${product.price}</p>
              <p className="stock">Stock: {product.stock}</p>
              <button onClick={() => handleAddToCart(product.id)}>
                Añadir al carrito
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Cliente API - api.js:**
```javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const api = axios.create({ baseURL: API_URL });

export const getProducts = () => api.get('/products');
export const addProduct = (product) => api.post('/products', product);
export const getCart = () => api.get('/cart');
export const addToCart = (productId, quantity) => 
  api.post('/cart', { productId, quantity });
export const loginUser = (username, password) =>
  api.post('/login', { username, password });
export const registerUser = (username, password) =>
  api.post('/users', { username, password });

export default api;
```

---

### 2. API Gateway
**Ubicación:** `/services/gateway`  
**Puerto:** 4000  
**Responsabilidades:**
- Punto de entrada único para todos los clientes
- Enrutamiento transparente a microservicios
- No contiene lógica de negocio
- Manejo de CORS y headers

**Archivo principal - index.js:**
```javascript
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Rutas a microservicios
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

// Health check
app.get('/health', (req, res) => res.json({ status: 'OK' }));

app.listen(PORT, () => {
  console.log(`API Gateway listening on port ${PORT}`);
});
```

**Tabla de enrutamiento:**

| Ruta del Cliente | Destino Interno | Microservicio | Puerto |
|---|---|---|---|
| GET `/products` | `/` (product) | Product Service | 4001 |
| POST `/products` | `/` (product) | Product Service | 4001 |
| GET `/cart` | `/` (cart) | Cart Service | 4002 |
| POST `/cart` | `/` (cart) | Cart Service | 4002 |
| POST `/users` | `/` (user) | User Service | 4003 |
| POST `/login` | `/login` (user) | User Service | 4003 |
| GET `/health` | Local | Gateway | 4000 |

---

### 3. Microservicio de Productos
**Ubicación:** `/services/product`  
**Puerto:** 4001  
**Responsabilidades:**
- Gestión del catálogo de productos
- Operaciones CRUD en tabla products
- Consultas de disponibilidad y stock

**Endpoints:**
```
GET /              # Listar todos los productos
POST /             # Crear nuevo producto
  Body: { name, description, price, stock }

Respuesta exitosa (200):
[
  { id: 1, name: "Laptop", description: "High-performance", price: 999.99, stock: 5 },
  ...
]
```

**Código del servicio:**
```javascript
const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4001;
app.use(express.json());

// Pool de conexiones a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// GET - Listar todos los productos
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST - Crear nuevo producto
app.post('/', async (req, res) => {
  const { name, description, price, stock } = req.body;
  
  if (!name || !price || stock === undefined) {
    return res.status(400).json({ 
      error: 'Missing required fields: name, price, stock' 
    });
  }

  try {
    const result = await pool.query(
      'INSERT INTO products (name, description, price, stock) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description || '', price, stock]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'OK' }));

app.listen(PORT, () => {
  console.log(`Product Service running on port ${PORT}`);
});
```

---

### 4. Microservicio de Carrito
**Ubicación:** `/services/cart`  
**Puerto:** 4002  
**Responsabilidades:**
- Gestión de items en el carrito
- Relación con tabla de productos
- Operaciones de lectura y escritura

**Endpoints:**
```
GET /              # Obtener carrito completo
POST /             # Agregar item al carrito
  Body: { productId, quantity }
```

**Código del servicio:**
```javascript
const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4002;
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// GET - Obtener carrito
app.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ci.id, ci.product_id, ci.quantity, p.name, p.price
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST - Agregar al carrito
app.post('/', async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity) {
    return res.status(400).json({ 
      error: 'Missing required fields: productId, quantity' 
    });
  }

  try {
    const result = await pool.query(
      'INSERT INTO cart_items (product_id, quantity) VALUES ($1, $2) RETURNING *',
      [productId, quantity]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(PORT, () => {
  console.log(`Cart Service running on port ${PORT}`);
});
```

---

### 5. Microservicio de Usuarios
**Ubicación:** `/services/user`  
**Puerto:** 4003  
**Responsabilidades:**
- Registro de nuevos usuarios
- Autenticación con contraseñas hasheadas
- Gestión de sesiones (estructura preparada para JWT)

**Endpoints:**
```
POST /             # Registrar nuevo usuario
  Body: { username, password }

POST /login        # Autenticar usuario
  Body: { username, password }
```

**Código del servicio:**
```javascript
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4003;
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// POST - Registrar usuario
app.post('/', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ 
      error: 'Missing required fields: username, password' 
    });
  }

  try {
    // Hash contraseña con bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
      [username, hashedPassword]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      // Violación de constraint UNIQUE
      res.status(409).json({ error: 'Username already exists' });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Database error' });
    }
  }
});

// POST - Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ 
      error: 'Missing required fields: username, password' 
    });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ id: user.id, username: user.username, message: 'Login successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});
```

---

## Esquema de Base de Datos

### Diseño Relacional

**PostgreSQL 15-Alpine** aloja tres tablas principales:

#### Tabla: `products`
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Propósito:** Almacenar el catálogo de productos disponibles
**Campos:**
- `id`: Identificador único (clave primaria)
- `name`: Nombre del producto (requerido)
- `description`: Descripción del producto (opcional)
- `price`: Precio unitario con 2 decimales
- `stock`: Cantidad disponible
- `created_at`: Timestamp de creación

**Índices recomendados:**
```sql
CREATE INDEX idx_products_name ON products(name);
```

---

#### Tabla: `cart_items`
```sql
CREATE TABLE cart_items (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Propósito:** Almacenar items en el carrito de compras
**Campos:**
- `id`: Identificador único
- `product_id`: Referencia a producto (clave foránea)
- `quantity`: Número de unidades
- `created_at`: Timestamp de adición

**Relación:**
- Un producto puede tener múltiples items en carrito
- Si se elimina un producto, se eliminan sus items (CASCADE)

---

#### Tabla: `users`
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Propósito:** Almacenar información de usuarios
**Campos:**
- `id`: Identificador único
- `username`: Nombre único de usuario
- `password`: Contraseña hasheada con bcrypt
- `created_at`: Timestamp de registro

**Restricciones de seguridad:**
- Username es único (previene duplicados)
- Contraseñas nunca se almacenan en texto plano
- Se utiliza bcrypt con salt=10

---

### Diagrama Entidad-Relación (ER)

```
┌──────────────────┐
│    products      │
├──────────────────┤
│ id (PK)          │
│ name             │
│ description      │
│ price            │
│ stock            │
│ created_at       │
└────────┬─────────┘
         │ (1:N)
         │ Referenced by
         │
┌────────▼──────────┐
│   cart_items      │
├───────────────────┤
│ id (PK)           │
│ product_id (FK) ──┼──> products(id)
│ quantity          │
│ created_at        │
└───────────────────┘

┌──────────────────┐
│      users       │
├──────────────────┤
│ id (PK)          │
│ username (UNIQUE)│
│ password         │
│ created_at       │
└──────────────────┘
(No relación directa en esta fase)
```

---

### Script de Inicialización

**Archivo:** `db/init.sql`

```sql
-- Crear tabla de productos
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de items en carrito
CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar datos de ejemplo
INSERT INTO products (name, description, price, stock) VALUES
  ('Laptop Dell XPS', 'Laptop de rendimiento superior', 999.99, 5),
  ('Mouse Logitech', 'Mouse inalámbrico de precisión', 29.99, 20),
  ('Teclado Mecánico', 'Teclado gaming RGB', 79.99, 10),
  ('Monitor Dell 27"', 'Monitor IPS 4K', 349.99, 3),
  ('Mochila Asus', 'Mochila para laptops', 49.99, 15)
ON CONFLICT DO NOTHING;
```

---

## API Endpoints

### Interfaz Unificada del Gateway

Los clientes interactúan **únicamente** con los endpoints del gateway (puerto 4000). El gateway redirige internamente a los microservicios.

### Productos

**`GET /products`** - Listar todos los productos

```bash
curl -X GET http://localhost:4000/products

# Respuesta 200 OK
[
  {
    "id": 1,
    "name": "Laptop Dell XPS",
    "description": "Laptop de rendimiento superior",
    "price": "999.99",
    "stock": 5,
    "created_at": "2024-01-15T10:30:00.000Z"
  },
  ...
]
```

**`POST /products`** - Crear nuevo producto

```bash
curl -X POST http://localhost:4000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Monitor Samsung",
    "description": "Monitor curvo gaming",
    "price": 399.99,
    "stock": 8
  }'

# Respuesta 201 Created
{
  "id": 6,
  "name": "Monitor Samsung",
  "description": "Monitor curvo gaming",
  "price": "399.99",
  "stock": 8,
  "created_at": "2024-01-15T14:45:00.000Z"
}
```

### Carrito

**`GET /cart`** - Obtener items del carrito

```bash
curl -X GET http://localhost:4000/cart

# Respuesta 200 OK
[
  {
    "id": 1,
    "product_id": 1,
    "quantity": 2,
    "name": "Laptop Dell XPS",
    "price": "999.99",
    "created_at": "2024-01-15T11:00:00.000Z"
  },
  ...
]
```

**`POST /cart`** - Añadir item al carrito

```bash
curl -X POST http://localhost:4000/cart \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 2,
    "quantity": 3
  }'

# Respuesta 201 Created
{
  "id": 2,
  "product_id": 2,
  "quantity": 3,
  "created_at": "2024-01-15T11:15:00.000Z"
}
```

### Usuarios

**`POST /users`** - Registrar novo usuario

```bash
curl -X POST http://localhost:4000/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "juan.perez",
    "password": "SecurePass123!"
  }'

# Respuesta 201 Created
{
  "id": 1,
  "username": "juan.perez"
}

# Respuesta 409 Conflict (usuario existe)
{
  "error": "Username already exists"
}
```

**`POST /login`** - Autenticar usuario

```bash
curl -X POST http://localhost:4000/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "juan.perez",
    "password": "SecurePass123!"
  }'

# Respuesta 200 OK
{
  "id": 1,
  "username": "juan.perez",
  "message": "Login successful"
}

# Respuesta 401 Unauthorized (credenciales inválidas)
{
  "error": "Invalid credentials"
}
```

### Health Checks

**`GET /health`** - Estado del gateway

```bash
curl -X GET http://localhost:4000/health

# Respuesta 200 OK
{
  "status": "OK"
}
```

---

## Flujo de Comunicación

### Caso de Uso 1: Listar Productos

```
┌─────────────────┐
│                 │
│ Frontend (React)│
│  (Puerto 5173)  │
│                 │
└────────┬────────┘
         │
         │ 1. GET /products (HTTP)
         │
         ▼
┌──────────────────────┐
│   API Gateway        │
│   (Puerto 4000)      │
└────────┬─────────────┘
         │
         │ 2. GET / (HTTP interno)
         │ Destino: http://product:4001
         │
         ▼
┌──────────────────────┐
│ Product Service      │
│ (Puerto 4001)        │
└────────┬─────────────┘
         │
         │ 3. Query PostgreSQL
         │ SELECT * FROM products
         │
         ▼
┌──────────────────────┐
│  PostgreSQL DB       │
│  (Puerto 5432)       │
└────────┬─────────────┘
         │
         │ 4. Retorna filas de productos
         │
         ▼
┌──────────────────────┐
│ Product Service      │
│ (respuesta JSON)     │
└────────┬─────────────┘
         │
         │ 5. Respuesta JSON al Gateway
         │
         ▼
┌──────────────────────┐
│   API Gateway        │
│ (proxy transparente) │
└────────┬─────────────┘
         │
         │ 6. Respuesta JSON al Frontend
         │
         ▼
┌─────────────────┐
│ Frontend        │
│ setState(...)   │
│ Re-renderiza    │
└─────────────────┘
```

**Tiempo total estimado:** 50-200ms (incluyendo latencia de BD)

---

### Caso de Uso 2: Agregar al Carrito

```
┌─────────────────┐
│                 │
│ Frontend (React)│
│  (Puerto 5173)  │
│ onClick evento  │
│                 │
└────────┬────────┘
         │
         │ 1. POST /cart
         │    { productId: 2, quantity: 1 }
         │
         ▼
┌──────────────────────┐
│   API Gateway        │
│   (Puerto 4000)      │
│   Enrutamiento       │
└────────┬─────────────┘
         │
         │ 2. POST /
         │ Destino: http://cart:4002
         │
         ▼
┌──────────────────────┐
│ Cart Service         │
│ (Puerto 4002)        │
│ Validación data      │
└────────┬─────────────┘
         │
         │ 3. INSERT INTO cart_items
         │    (product_id=2, quantity=1)
         │
         ▼
┌──────────────────────┐
│  PostgreSQL DB       │
│  (Insertión)         │
└────────┬─────────────┘
         │
         │ 4. Retorna item creado
         │
         ▼
┌──────────────────────┐
│ Cart Service         │
│ Respuesta 201        │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│   API Gateway        │
│ (proxy transparente) │
└────────┬─────────────┘
         │
         ▼
┌─────────────────┐
│ Frontend        │
│ alert() & estado│
│ se actualiza    │
└─────────────────┘
```

---

### Caso de Uso 3: Autenticar Usuario

```
┌─────────────────┐
│                 │
│ Frontend (React)│
│ Formulario login│
│                 │
└────────┬────────┘
         │
         │ 1. POST /login
         │    { username, password }
         │
         ▼
┌──────────────────────┐
│   API Gateway        │
│   (Puerto 4000)      │
└────────┬─────────────┘
         │
         │ 2. POST /login
         │ Destino: http://user:4003
         │
         ▼
┌──────────────────────┐
│ User Service         │
│ (Puerto 4003)        │
│ Validación input     │
└────────┬─────────────┘
         │
         │ 3. SELECT * FROM users
         │    WHERE username = $1
         │
         ▼
┌──────────────────────┐
│  PostgreSQL DB       │
│  (Búsqueda usuario)  │
└────────┬─────────────┘
         │
         │ 4. Usuario encontrado
         │
         ▼
┌──────────────────────┐
│ User Service         │
│ bcrypt.compare()     │
│ Validar contraseña   │
└────────┬─────────────┘
         │
         │ 5a. ✓ Contraseña válida
         │    Retornar { id, username }
         │
         │ 5b. ✗ Contraseña inválida
         │    Retornar 401 Unauthorized
         │
         ▼
┌──────────────────────┐
│ Frontend             │
│ Guardar token/datos  │
│ O mostrar error      │
└──────────────────────┘
```

---

## Configuración de Docker Compose

### Archivo: `docker-compose.yml`

```yaml
version: '3.8'

services:
  # Base de Datos - PostgreSQL
  db:
    image: postgres:15-alpine
    container_name: webstack_db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: webstack
    volumes:
      - db_data:/var/lib/postgresql/data
      - ./db/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    networks:
      - webstack_network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Microservicio de Productos
  product:
    build:
      context: ./services/product
      dockerfile: Dockerfile
    container_name: webstack_product
    environment:
      DATABASE_URL: postgres://postgres:postgres@db:5432/webstack
      PORT: 4001
    networks:
      - webstack_network
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "4001:4001"

  # Microservicio de Carrito
  cart:
    build:
      context: ./services/cart
      dockerfile: Dockerfile
    container_name: webstack_cart
    environment:
      DATABASE_URL: postgres://postgres:postgres@db:5432/webstack
      PORT: 4002
    networks:
      - webstack_network
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "4002:4002"

  # Microservicio de Usuarios
  user:
    build:
      context: ./services/user
      dockerfile: Dockerfile
    container_name: webstack_user
    environment:
      DATABASE_URL: postgres://postgres:postgres@db:5432/webstack
      PORT: 4003
    networks:
      - webstack_network
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "4003:4003"

  # API Gateway
  gateway:
    build:
      context: ./services/gateway
      dockerfile: Dockerfile
    container_name: webstack_gateway
    environment:
      PORT: 4000
    ports:
      - "4000:4000"
    networks:
      - webstack_network
    restart: unless-stopped
    depends_on:
      - product
      - cart
      - user

  # Frontend - React + Vite
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: webstack_frontend
    ports:
      - "5173:5173"
    networks:
      - webstack_network
    restart: unless-stopped
    environment:
      VITE_API_URL: http://localhost:4000

networks:
  webstack_network:
    driver: bridge

volumes:
  db_data:
    driver: local
```

### Explicación de Configuraciones

**Version:** `3.8` - Compatible con Docker Engine 20.10+

**Servicios (6 total):**
1. `db` - PostgreSQL para datos compartidos
2. `product` - Servicio de productos
3. `cart` - Servicio de carrito
4. `user` - Servicio de usuarios
5. `gateway` - Enrutador API
6. `frontend` - Interfaz React

**Dependencias (`depends_on`):**
- `product`, `cart`, `user` dependen de `db` (espera health check)
- `gateway` depende de `product`, `cart`, `user`
- `frontend` es independiente (solo necesita red)

**Redes:**
- Todos los servicios conectados a `webstack_network` (bridge)
- Descubrimiento automático por nombre: `http://product:4001`

**Volúmenes:**
- `db_data` - Persistencia de datos PostgreSQL
- `init.sql` - Mount de solo lectura para inicializador de BD

---

## Despliegue y Ejecución

### Requisitos Previos

```bash
# Verificar Docker está instalado
docker --version        # Docker version 20.10+
docker-compose --version # Docker Compose 1.29+

# Verificar estructura de directorio
tree -L 2 /workspaces/Docker_IAW
```

### Pasos para Desplegar

**1. Clonar y acceder al repositorio**
```bash
cd /workspaces/Docker_IAW
```

**2. Construir imágenes**
```bash
docker-compose build

# Output esperado:
# Building db ... done
# Building product ... done
# Building cart ... done
# Building user ... done
# Building gateway ... done
# Building frontend ... done
```

**3. Iniciar servicios**
```bash
# Iniciar en background
docker-compose up -d

# O iniciar en foreground para ver logs
docker-compose up

# Output esperado:
# Creating webstack_db ... done
# Creating webstack_product ... done
# Creating webstack_cart ... done
# Creating webstack_user ... done
# Creating webstack_gateway ... done
# Creating webstack_frontend ... done
```

**4. Verificar estado de servicios**
```bash
docker-compose ps

# Output esperado:
# NAME                COMMAND             STATUS          PORTS
# webstack_db         postgres            Up (healthy)    5432/tcp
# webstack_product    node index.js       Up              4001/tcp
# webstack_cart       node index.js       Up              4002/tcp
# webstack_user       node index.js       Up              4003/tcp
# webstack_gateway    node index.js       Up              4000/tcp
# webstack_frontend   npm run dev         Up              5173/tcp
```

**5. Verificar conectividad**
```bash
# Prueba del Gateway
curl http://localhost:4000/health
# {"status":"OK"}

# Prueba de Productos
curl http://localhost:4000/products
# [{"id":1,"name":"Laptop Dell XPS",...}]

# Acceder a Frontend
open http://localhost:5173
```

### Gestión de Servicios

**Ver logs**
```bash
# Logs de todos los servicios
docker-compose logs -f

# Logs de un servicio específico
docker-compose logs -f product
docker-compose logs -f gateway
```

**Detener servicios**
```bash
# Parar sin eliminar
docker-compose stop

# Eliminar contenedores pero mantener volúmenes
docker-compose down

# Eliminar completamente (incluyendo datos)
docker-compose down -v
```

**Reiniciar servicios**
```bash
# Reiniciar todos
docker-compose restart

# Reiniciar específico
docker-compose restart product
```

---

## Escalabilidad

### Escalado Horizontal de Servicios

Los microservicios pueden escalarse independientemente:

**Escalar servicio de productos a 3 instancias:**
```yaml
# docker-compose.override.yml
version: '3.8'

services:
  product:
    deploy:
      replicas: 3
```

**Usar Docker Swarm o Kubernetes para orquestación avanzada:**

El mayor beneficio de microservicios es que puedes:
- **Escalar solo el servicio que consume más recursos**
- **Usar diferentes tecnologías por servicio**
- **Desplegar actualizaciones sin downtime total**
- **Aislar fallos a un único servicio**

### Ejemplo: Escalar por Demanda

```bash
# Aumentar instancias de producto (imaginar orquestación)
docker-compose up -d --scale product=3

# Aumentar solo carrito
docker-compose up -d --scale cart=2

# Con un load balancer, las nuevas instancias
# distribuyen la carga automáticamente
```

### Consideraciones de Escalabilidad

1. **Estado compartido**: Los servicios comparten una BD central (PostgreSQL)
   - Ventaja: Consistencia garantizada
   - Desventaja: BD se convierte en cuello de botella

2. **Soluciones**:
   - Usar Redis para caché distribuido
   - Implementar read replicas en PostgreSQL
   - Usar sharding con base de datos como Cassandra

3. **Monitoreo**:
   - Métricas de CPU/memoria por servicio
   - Latencia de queries a BD
   - Throughput del API Gateway

---

## Monitoreo y Salud de Servicios

### Health Checks Configurados

**PostgreSQL:**
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U postgres"]
  interval: 10s
  timeout: 5s
  retries: 5
```

**Microservicios (recomendado añadir):**
```javascript
app.get('/health', (req, res) => {
  // Verificar conexión a BD
  pool.query('SELECT NOW()', (err, result) => {
    if (err) return res.status(503).json({ status: 'unhealthy' });
    res.json({ status: 'healthy', timestamp: new Date() });
  });
});
```

### Monitoreo con Docker

**Ver estado en tiempo real:**
```bash
docker stats webstack_product webstack_cart webstack_user
```

**Output:**
```
CONTAINER           CPU %    MEM USAGE / LIMIT
webstack_product    0.5%     45.2MiB / 512MiB
webstack_cart       0.3%     42.1MiB / 512MiB
webstack_user       0.4%     43.8MiB / 512MiB
```

### Logging Centralizado

**Ver logs de servicio específico:**
```bash
docker-compose logs product --tail=100 -f
```

**Recolectar logs a archivo:**
```bash
docker-compose logs > logs.txt
```

### Mejoras Futuras de Monitoreo

1. **Prometheus + Grafana**: Métricas y dashboards
2. **ELK Stack**: Elasticsearch, Logstash, Kibana
3. **Jaeger**: Distributed tracing entre servicios
4. **AlertManager**: Alertas automáticas

---

## Resumen Comparativo

### Monolito vs Microservicios

| Aspecto | Monolito (Fase 1) | Microservicios (Fase 2) |
|---|---|---|
| **Despliegue** | Un solo contenedor | 6 contenedores independientes |
| **Escalabilidad** | Escalar todo junto | Escalar por servicio |
| **Fallos** | Un error derriba todo | Fallos aislados |
| **Desarrollo** | Un repositorio, un equipo | Múltiples repos, múltiples equipos |
| **Complejidad** | Menor inicialmente | Mayor operativa |
| **Latencia** | Mínima (mismo proceso) | +50-200ms por llamada RPC |
| **Tecnología** | Una stack fija | Heterogénea por servicio |
| **BD** | SQLite local | PostgreSQL compartida |

### Ventajas de esta Implementación

✅ **Separación de responsabilidades** - Cada servicio hace una cosa bien  
✅ **Escalabilidad independiente** - Producto vs Cart escalados por separado  
✅ **Api consistente** - Gateway unifica interfaz  
✅ **Base de datos compartida** - Sin sincronización entre servicios  
✅ **Containerización completa** - Reproducible en cualquier ambiente  
✅ **Frontend reactivo** - React + Vite ofrecen UX moderna  

### Próximos Pasos Sugeridos

1. Agregar JWT para autenticación entre servicios
2. Implementar circuit breaker en gateway
3. Añadir tests unitarios y de integración
4. Implementar CI/CD (GitHub Actions, GitLab CI)
5. Monitoreo con Prometheus/Grafana
6. Migrar a Kubernetes para orquestación empresarial

---

**Documento generado:** Diciembre 2024  
**Versión:** 1.0  
**Arquitectura:** WebStack Microservicios  
**Stack:** Node.js + Express + React + PostgreSQL + Docker Compose
