# Diagrama Arquitectónico - WebStack Microservicios

## Visualización Completa del Sistema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          INTERNET / USUARIOS                                 │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                    HTTP/S
                                       │
                    ┌──────────────────▼──────────────────┐
                    │                                     │
                    │        FRONTEND (React + Vite)       │
                    │          Puerto 5173                │
                    │  ┌──────────────────────────────┐  │
                    │  │  App.jsx                      │  │
                    │  │  ├─ useState (productos)      │  │
                    │  │  ├─ useEffect (fetch)         │  │
                    │  │  └─ onClick handlers          │  │
                    │  │                              │  │
                    │  │  api.js (Axios Client)       │  │
                    │  │  └─ BASE_URL: localhost:4000 │  │
                    │  │                              │  │
                    │  │  App.css (Estilos)           │  │
                    │  │  └─ Gradientes, Responsive   │  │
                    │  └──────────────────────────────┘  │
                    │                                     │
                    │        Docker Container            │
                    │    Node 18-Alpine (serve)          │
                    └──────────────────┬──────────────────┘
                                       │
                                JavaScript XHR/Fetch
                                       │
                    ┌──────────────────▼──────────────────┐
                    │                                     │
                    │        API GATEWAY                  │
                    │          Puerto 4000                │
                    │  ┌──────────────────────────────┐  │
                    │  │  Express.js                  │  │
                    │  │  ├─ CORS Middleware         │  │
                    │  │  ├─ JSON Parser             │  │
                    │  │  └─ Health Endpoint         │  │
                    │  │                              │  │
                    │  │  Router (http-proxy-mw)     │  │
                    │  │  ├─ /products  → :4001      │  │
                    │  │  ├─ /cart      → :4002      │  │
                    │  │  ├─ /users     → :4003      │  │
                    │  │  └─ /login     → :4003      │  │
                    │  └──────────────────────────────┘  │
                    │                                     │
                    │        Docker Container            │
                    │          Node 18-Alpine            │
                    └────────┬────────────┬────────────┬──┘
                             │            │            │
                      HTTP/JSON    HTTP/JSON    HTTP/JSON
                             │            │            │
        ┌────────────────────▼┐  ┌───────▼────────┐  ┌────────▼────────────┐
        │                     │  │                │  │                    │
        │  PRODUCT SERVICE    │  │  CART SERVICE  │  │  USER SERVICE      │
        │   Puerto 4001       │  │  Puerto 4002   │  │  Puerto 4003       │
        │  ┌────────────────┐ │  │ ┌────────────┐ │  │ ┌──────────────┐  │
        │  │ Express.js     │ │  │ │Express.js  │ │  │ │ Express.js   │  │
        │  │ GET /          │ │  │ │ GET /      │ │  │ │ POST /       │  │
        │  │ POST /         │ │  │ │ POST /     │ │  │ │ POST /login  │  │
        │  └────────────────┘ │  │ └────────────┘ │  │ └──────────────┘  │
        │  ┌────────────────┐ │  │ ┌────────────┐ │  │ ┌──────────────┐  │
        │  │ pg.Pool        │ │  │ │ pg.Pool    │ │  │ │ bcrypt       │  │
        │  │ Queries:       │ │  │ │ Queries:   │ │  │ │ Hash pwd     │  │
        │  │ SELECT *       │ │  │ │ SELECT *, │ │  │ │ Compare pwd  │  │
        │  │ INSERT INTO    │ │  │ │ INSERT     │ │  │ │              │  │
        │  └────────────────┘ │  │ └────────────┘ │  │ └──────────────┘  │
        │                     │  │                │  │                    │
        │ Docker Container    │  │ Docker         │  │ Docker Container   │
        │ Node 18-Alpine      │  │ Container      │  │ Node 18-Alpine     │
        │                     │  │ Node 18-Alpine │  │                    │
        └────────────┬────────┘  └────────┬───────┘  └────────┬───────────┘
                     │                    │                    │
                     └────────────────────┼────────────────────┘
                                          │
                                  DATABASE_URL env
                                          │
                     ┌────────────────────▼────────────────────┐
                     │                                         │
                     │      POSTGRESQL 15-ALPINE               │
                     │        Puerto 5432 (interno)             │
                     │                                         │
                     │      ┌──────────────────────────────┐  │
                     │      │ SCHEMA webstack              │  │
                     │      ├──────────────────────────────┤  │
                     │      │ ◆ products                   │  │
                     │      │   ├─ id (PK)                │  │
                     │      │   ├─ name                   │  │
                     │      │   ├─ description            │  │
                     │      │   ├─ price                  │  │
                     │      │   ├─ stock                  │  │
                     │      │   └─ created_at             │  │
                     │      │                             │  │
                     │      │ ◆ cart_items                │  │
                     │      │   ├─ id (PK)                │  │
                     │      │   ├─ product_id (FK) ─┐    │  │
                     │      │   ├─ quantity         │    │  │
                     │      │   └─ created_at       │    │  │
                     │      │                       ├──► products
                     │      │ ◆ users               │    │  │
                     │      │   ├─ id (PK)          │    │  │
                     │      │   ├─ username (UNIQUE)    │  │
                     │      │   ├─ password             │  │
                     │      │   └─ created_at       │    │  │
                     │      │                       │    │  │
                     │      └──────────────────────────────┘  │
                     │                                         │
                     │      Volume: db_data                    │
                     │      Init Script: init.sql              │
                     │                                         │
                     │  Docker Container                       │
                     │  PostgreSQL 15-Alpine                   │
                     └─────────────────────────────────────────┘


┌───────────────────────────────────────────────────────────────────────────────┐
│                          DOCKER COMPOSE NETWORK                                │
│                        webstack_network (bridge)                               │
│                                                                                │
│  Descubrimiento de Servicios:                                                 │
│  • product:4001   (Resuelto automáticamente a IP del contenedor)              │
│  • cart:4002                                                                   │
│  • user:4003                                                                   │
│  • db:5432                                                                     │
│  • gateway:4000                                                                │
│  • frontend:5173                                                               │
│                                                                                │
│  Volúmenes Compartidos:                                                        │
│  • db_data     → /var/lib/postgresql/data (Persistencia)                      │
│  • init.sql    → /docker-entrypoint-initdb.d (Inicializador)                 │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

## Flujos de Datos

### Flujo 1: Lista de Productos (GET)

```
┌─────────────┐
│   Browser   │ (usuario hace clic en "Ver Productos")
└──────┬──────┘
       │
       │ useEffect() → api.getProducts()
       │
       ▼
┌──────────────────────────────────────┐
│  Axios Request                        │
│  GET http://localhost:4000/products   │
└──────────────────┬───────────────────┘
                   │
                   ▼
       ┌───────────────────────┐
       │   API Gateway         │
       │   Port 4000           │
       │                       │
       │  Matcher: /products   │
       │  Action: Proxy to      │
       │  http://product:4001   │
       └───────────┬───────────┘
                   │
                   ▼
      ┌──────────────────────────┐
      │ Product Service          │
      │ Port 4001                │
      │                          │
      │ app.get('/', async...)   │
      │ await pool.query(        │
      │   'SELECT * FROM prod'   │
      │ )                        │
      └──────────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  PostgreSQL          │
          │  Query ejecutada      │
          │  SELECT * FROM       │
          │  products            │
          └──────────────┬───────┘
                         │
                         ▼ (Array de productos)
          ┌──────────────────────┐
          │  [                   │
          │  { id: 1, name: ... },
          │  { id: 2, name: ... },
          │  ...                 │
          │  ]                   │
          └──────────────┬───────┘
                         │
       ┌─────────────────▼─────────────────┐
       │  res.json(result.rows)            │
       │  (Response 200 OK)                │
       └──────────────┬────────────────────┘
                      │
       ┌──────────────▼──────────────┐
       │ Gateway (proxy transparente)│
       │ Forwarda respuesta hacia    │
       └──────────────┬──────────────┘
                      │
                      ▼
       ┌──────────────────────────┐
       │ Axios Response Handler   │
       │ data = response.data     │
       └──────────────┬───────────┘
                      │
                      ▼
       ┌──────────────────────────┐
       │ React setState           │
       │ setProducts(data)        │
       │ Trigger re-render        │
       └──────────────┬───────────┘
                      │
                      ▼
       ┌──────────────────────────┐
       │ productos.map(product =>)│
       │ Renderizar <div> c/item  │
       └──────────────┬───────────┘
                      │
                      ▼
       ┌──────────────────────────┐
       │ Browser actualiza DOM    │
       │ Muestra lista productos  │
       └──────────────────────────┘

Tiempo total: 50-200ms en red local
```

---

### Flujo 2: Agregar al Carrito (POST)

```
┌─────────────────────────────────┐
│ Usuario hace clic                │
│ "Añadir al carrito"             │
│ (producto ID: 2, cantidad: 1)   │
└──────────────┬──────────────────┘
               │
               ▼
    ┌────────────────────────────┐
    │ onClick handler dispara     │
    │ handleAddToCart(productId)  │
    └────────────┬───────────────┘
                 │
                 ▼
   ┌──────────────────────────────┐
   │ api.addToCart(productId, qty) │
   │ (Axios POST)                  │
   │                               │
   │ POST /cart                    │
   │ { productId: 2, quantity: 1 } │
   └────────────┬─────────────────┘
                │
                ▼
   ┌────────────────────────┐
   │ API Gateway            │
   │ :4000/cart             │
   │                        │
   │ Matcher: /cart         │
   │ Method: POST           │
   │ Proxy to: :4002        │
   └──────────────┬─────────┘
                  │
                  ▼
    ┌──────────────────────────┐
    │ Cart Service             │
    │ Port 4002                │
    │                          │
    │ app.post('/', async ...) │
    │ const { productId, qty }  │
    │ FROM req.body             │
    └────────────┬──────────────┘
                 │
    ┌────────────▼───────────────┐
    │ Validar inputs             │
    │ if (!productId || !qty)    │
    │   return 400               │
    └────────────┬───────────────┘
                 │ (Válido)
                 ▼
     ┌──────────────────────────┐
     │ await pool.query(        │
     │  'INSERT INTO cart_items │
     │   (product_id,quantity)  │
     │   VALUES ($1,$2)        │
     │  RETURNING *'           │
     │ )                        │
     └────────────┬─────────────┘
                  │
                  ▼
        ┌─────────────────────┐
        │ PostgreSQL INSERT   │
        │ Nueva fila agregada │
        └────────────┬────────┘
                     │
                     ▼
        ┌─────────────────────┐
        │ RETURNING *         │
        │ { id: 5,           │
        │   product_id: 2,    │
        │   quantity: 1 }     │
        └────────────┬────────┘
                     │
        ┌────────────▼────────────────┐
        │ res.status(201).json(      │
        │   result.rows[0]           │
        │ )                          │
        └────────────┬───────────────┘
                     │
    ┌────────────────▼────────────────┐
    │ Gateway (forward response)       │
    └────────────┬────────────────────┘
                 │
                 ▼
    ┌──────────────────────────────┐
    │ Axios Response Handler       │
    │ 201 Created recibido        │
    │ data = { id: 5, ... }        │
    └────────────┬─────────────────┘
                 │
                 ▼
    ┌──────────────────────────────┐
    │ Frontend (React)             │
    │ alert('Agregado al carrito') │
    └────────────┬─────────────────┘
                 │
                 ▼
    ┌──────────────────────────────┐
    │ (Opcional) fetch carrito     │
    │ setCart(new items)           │
    │ Re-render                    │
    └──────────────────────────────┘

Tiempo total: 100-300ms
```

---

### Flujo 3: Autenticación (POST /login)

```
┌──────────────────────────────┐
│ Usuario ingresa credenciales │
│ nombre: "juan.perez"         │
│ contraseña: "Pass123"        │
└──────────────┬───────────────┘
               │
               ▼
    ┌───────────────────────────┐
    │ form submit → loginUser() │
    │ (API call)                │
    └───────────────┬───────────┘
                    │
                    ▼
    ┌────────────────────────────────┐
    │ POST /login                    │
    │ { username, password }         │
    │ endpoint: localhost:4000       │
    └───────────────┬────────────────┘
                    │
                    ▼
    ┌─────────────────────────────┐
    │ API Gateway :4000           │
    │ Route: /login               │
    │ Target: http://user:4003    │
    └─────────────┬───────────────┘
                  │
                  ▼
     ┌────────────────────────────┐
     │ User Service               │
     │ Port 4003                  │
     │                            │
     │ app.post('/login', async..)│
     │ const { username, password}│
     │ FROM req.body              │
     └────────────┬───────────────┘
                  │
    ┌─────────────▼──────────────┐
    │ await pool.query(          │
    │  'SELECT * FROM users      │
    │   WHERE username = $1'     │
    │ )                          │
    └────────────┬───────────────┘
                 │
                 ▼
     ┌────────────────────────────┐
     │ User encontrado (Fila 1)   │
     │ id: 1                      │
     │ username: "juan.perez"     │
     │ password:(bcrypt hash)     │
     └────────────┬───────────────┘
                  │
    ┌─────────────▼──────────────────────┐
    │ bcrypt.compare(                    │
    │  inputPassword,                    │
    │  user.password                     │
    │ )                                  │
    │ → true/false                       │
    └────────────┬──────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼ (Válido)   ▼ (Inválido)
    ┌──────┐    ┌──────────────────┐
    │ true │    │ false            │
    └───┬──┘    └──────┬───────────┘
        │               │
        ▼               ▼
   ┌─────────────┐  ┌──────────────┐
   │ res.json({  │  │ res.status   │
   │  id: 1,     │  │ (401).json({ │
   │  username   │  │  error:      │
   │  message:   │  │  "Invalid..."│
   │  "success"  │  │ })           │
   │ })          │  └──────┬───────┘
   └──────┬──────┘         │
          │ (200 OK)  │ (401 Unauthorized)
          │                 │
          └────────┬────────┘
                   │
     ┌─────────────▼─────────────┐
     │ Gateway forwarda respuesta │
     │ a Frontend                 │
     └─────────────┬─────────────┘
                   │
      
      SI ÉXITO (200):
      ├─ Axios recibe datos usuario
      ├─ localStorage.setItem('userId', data.id)
      ├─ Redirigir a dashboard
      └─ setState({ isLoggedIn: true })
      
      SI FALLO (401):
      ├─ Axios catch error
      ├─ alert('Credenciales inválidas')
      └─ Mantener en login form

Tiempo total: 200-500ms (incluye hashing bcrypt)
Nota: bcrypt.compare() es deliberadamente lento (protección contra fuerza bruta)
```

---

## Tabla Comparativa de Endpoints

```
┌────────────────────────┬──────────────────┬────────────────────┬─────────────┐
│ Endpoint (Gateway)     │ Método HTTP      │ Microservicio      │ Puerto      │
├────────────────────────┼──────────────────┼────────────────────┼─────────────┤
│ /health                │ GET              │ Gateway (local)    │ 4000        │
├────────────────────────┼──────────────────┼────────────────────┼─────────────┤
│ /products              │ GET              │ Product Service    │ 4001        │
│                        │ POST             │                    │             │
├────────────────────────┼──────────────────┼────────────────────┼─────────────┤
│ /cart                  │ GET              │ Cart Service       │ 4002        │
│                        │ POST             │                    │             │
├────────────────────────┼──────────────────┼────────────────────┼─────────────┤
│ /users                 │ POST             │ User Service       │ 4003        │
├────────────────────────┼──────────────────┼────────────────────┼─────────────┤
│ /login                 │ POST             │ User Service       │ 4003        │
└────────────────────────┴──────────────────┴────────────────────┴─────────────┘
```

---

## Configuración de Docker Compose

```yaml
version: '3.8'

# Servicios
services:
  db:              # PostgreSQL - Base de datos compartida
    image: postgres:15-alpine
    ports: [5432]
    volumes:
      - db_data:/var/lib/postgresql/data
      - ./db/init.sql:/docker-entrypoint-initdb.d/init.sql
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=webstack

  product:         # Product Service
    build: ./services/product
    depends_on: [db]
    environment:
      - DATABASE_URL=postgres://postgres:postgres@db:5432/webstack
      - PORT=4001
    ports: [4001]

  cart:            # Cart Service
    build: ./services/cart
    depends_on: [db]
    environment:
      - DATABASE_URL=postgres://postgres:postgres@db:5432/webstack
      - PORT=4002
    ports: [4002]

  user:            # User Service
    build: ./services/user
    depends_on: [db]
    environment:
      - DATABASE_URL=postgres://postgres:postgres@db:5432/webstack
      - PORT=4003
    ports: [4003]

  gateway:         # API Gateway
    build: ./services/gateway
    depends_on: [product, cart, user]
    environment:
      - PORT=4000
    ports: [4000]

  frontend:        # React Frontend
    build: ./frontend
    environment:
      - VITE_API_URL=http://localhost:4000
    ports: [5173]

# Redes (bridge network para service discovery)
networks:
  webstack_network:
    driver: bridge

# Volúmenes (persistencia de datos)
volumes:
  db_data:
    driver: local
```

---

## Dependencias de Servicios

```
                    ┌─────────────┐
                    │  frontend   │
                    │  React/Vite │
                    └─────────────┘
                          │
                          ├─ Llama HTTP a API Gateway
                          │
        ┌─────────────────▼──────────┐
        │    API Gateway             │
        │   (http-proxy-middleware)  │
        │     Puerto 4000            │
        └──┬──────────────┬──────────┬┘
           │              │          │
     ┌─────▼──┐    ┌─────▼──┐   ┌──▼─────┐
     │Product │    │ Cart   │   │  User  │
     │Service │    │Service │   │Service │
     │:4001   │    │ :4002  │   │ :4003  │
     └────┬───┘    └────┬───┘   └───┬────┘
          │             │           │
          │             │           │
          └─────────────┼───────────┘
                        │
                ┌───────▼────────┐
                │  PostgreSQL    │
                │  Port 5432     │
                │  (interno)     │
                └────────────────┘
```

---

## Ciclo de Vida de Solicitud-Respuesta (Completo)

```
1. CLIENTE (Navegador)
   ├─ Usuario interactúa (click, submit)
   ├─ React event handler ejecuta
   ├─ api.js (Axios) prepara request
   │  ├─ METHOD: GET/POST
   │  ├─ URL: http://localhost:4000/<endpoint>
   │  ├─ HEADERS: Content-Type, Accept
   │  └─ BODY: { datos en JSON }
   └─ Envía HTTP request por red

2. API GATEWAY (http://localhost:4000)
   ├─ Express escucha en puerto 4000
   ├─ Middleware procesa:
   │  ├─ CORS headers
   │  ├─ JSON body parsing
   │  └─ Request logging (opcional)
   ├─ Router hace matching:
   │  ├─ if (req.path === '/products')
   │  ├─ if (req.path === '/cart')
   │  ├─ if (req.path === '/users')
   │  └─ if (req.path === '/login')
   ├─ http-proxy-middleware:
   │  ├─ Fowarda request al target
   │  ├─ changeOrigin: true (modifica Host header)
   │  └─ pathRewrite (opcional, trim path components)
   └─ Espera respuesta de microservicio

3. MICROSERVICIO (Product/Cart/User)
   ├─ Express escucha en su puerto (4001/4002/4003)
   ├─ Request handler ejecuta:
   │  ├─ Validación de entrada
   │  ├─ Acceso a base de datos (pg.Pool.query)
   │  ├─ Procesamiento de datos
   │  │  ├─ (Productos: SELECT, INSERT)
   │  │  ├─ (Carrito: SELECT, INSERT c/ FK)
   │  │  └─ (Usuarios: SELECT, INSERT c/ hash bcrypt)
   │  └─ Formateo de respuesta JSON
   ├─ PostgreSQL query:
   │  ├─ Valida SQL
   │  ├─ Ejecuta contra tablas
   │  ├─ Retorna resultado (rows)
   │  └─ (Si error: lanza excepción)
   ├─ Respuesta HTTP:
   │  ├─ res.status(200/201/400/401/500)
   │  ├─ res.json({ resultado o error })
   │  └─ Envía respuesta al Gateway
   └─ Gateway recibe respuesta

4. API GATEWAY (Forwarding)
   ├─ Recibe respuesta del microservicio
   ├─ La forwarda transparentemente al cliente
   │  ├─ Status: 200, 201, 400, 401, etc.
   │  ├─ Headers: Copy desde microservicio
   │  └─ Body: JSON sin modificar
   └─ Cliente recibe respuesta

5. CLIENTE (Manejo de Respuesta)
   ├─ Axios Promise resolve/reject:
   │  ├─ Status 2xx: then()
   │  │  ├─ data = response.data
   │  │  ├─ React setState(data)
   │  │  ├─ Trigger re-render
   │  │  └─ DOM actualiza automáticamente
   │  └─ Status 4xx/5xx: catch()
   │     ├─ error = new Error(...)
   │     ├─ alert/console.error()
   │     └─ UI muestra error
   └─ Fin de ciclo

TIEMPO TOTAL (latencia de red):
├─ HTTP travel time:  5-10ms
├─ Procesamiento GW:  1-5ms
├─ Microservicio:     10-50ms
├─ PostgreSQL query:  5-30ms
├─ Retorno red:       5-10ms
└─ ────────────────────────
   TOTAL: 30-200ms en red local
   (En producción con RTT: 100-500ms)
```

---

**Documento Generado:** Diciembre 2024  
**Propósito:** Visualización arquitectónica completa del sistema WebStack Microservicios
