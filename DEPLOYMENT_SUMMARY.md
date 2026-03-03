# WebStack - Resumen Completo de Despliegue

## 📋 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Despliegue Local (Docker Compose)](#despliegue-local-docker-compose)
4. [Despliegue Kubernetes](#despliegue-kubernetes)
5. [Despliegue Vercel](#despliegue-vercel)
6. [Endpoints de la API](#endpoints-de-la-api)
7. [Variables de Entorno](#variables-de-entorno)
8. [Troubleshooting](#troubleshooting)

---

## Descripción General

**WebStack** es una arquitectura de microservicios moderna que implementa un sistema de e-commerce con:

- **Frontend:** React 18 + Vite (SPA reactivo)
- **Backend:** 4 microservicios independientes + API Gateway
- **CMS:** Strapi (gestor de contenidos headless)
- **Base de Datos:** PostgreSQL
- **Orquestación:** Docker Compose (desarrollo), Kubernetes (producción)
- **Despliegue:** Vercel (serverless)

**Características:**
- ✅ Arquitectura desacoplada y escalable
- ✅ Autenticación con bcrypt + JWT
- ✅ Manejo de carrito de compras
- ✅ Sistema de órdenes con UUID
- ✅ Headless CMS con Strapi
- ✅ Multi-despliegue (Docker, K8s, Vercel)

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                     Cliente (Navegador)                      │
├─────────────────────────────────────────────────────────────┤
│         React 18 + Vite (SPA) - Puerto 5173                  │
│  http://localhost:5173 (desarrollo)                         │
│  https://webstack.vercel.app (producción)                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              API Gateway (Express.js)                        │
│              Puerto 4000 - Proxy reverso                     │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ Rutas:                                              │   │
│   │ GET/POST /health           → Health Check          │   │
│   │ GET/POST /products         → Product Service :4001 │   │
│   │ GET/POST /cart             → Cart Service :4002    │   │
│   │ POST /users, /login        → User Service :4003    │   │
│   │ GET/POST/PATCH /orders     → Orders Service :4004  │   │
│   │ /cms/*                     → Strapi CMS :1337      │   │
│   └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↓
          ┌───────────────┼───────────────┐
          ↓               ↓               ↓
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │ Product  │    │  Cart    │    │  User    │
    │ Service  │    │ Service  │    │ Service  │
    │:4001     │    │:4002     │    │:4003     │
    └──────────┘    └──────────┘    └──────────┘
          ↓               ↓               ↓
    ┌─────────────────────────────────────────┐
    │       PostgreSQL (Puerto 5432)          │
    │                                         │
    │  Tablas:                                │
    │  - products (catálogo)                  │
    │  - cart_items (carrito)                 │
    │  - users (autenticación)                │
    │  - orders (pedidos con UUID)            │
    └─────────────────────────────────────────┘
```

---

## Despliegue Local (Docker Compose)

### Estructura del Proyecto

```
Docker_IAW/
├── frontend/                 # React + Vite
│   ├── src/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json
│
├── services/
│   ├── product/            # Microservicio de productos
│   │   ├── index.js
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── cart/               # Microservicio de carrito
│   ├── user/               # Microservicio de usuarios
│   ├── orders/             # Microservicio de órdenes (NUEVO)
│   ├── gateway/            # API Gateway
│   └── cms/                # Strapi CMS (NUEVO)
│
├── db/
│   └── init.sql           # Schema + datos iniciales
│
├── k8s/                   # Manifiestos Kubernetes
│   ├── 00-namespace.yaml
│   ├── 01-postgres.yaml
│   ├── 02-microservices.yaml
│   ├── 03-gateway.yaml
│   ├── 04-strapi.yaml
│   ├── 05-frontend.yaml
│   └── 06-ingress.yaml
│
├── docker-compose.yml     # Orquestación local
├── DEPLOYMENT_KUBERNETES.md
├── DEPLOYMENT_VERCEL.md
└── README.md
```

### Pasos de Despliegue Local

#### 1. Requisitos Previos

```bash
# Verificar componentes instalados
docker --version          # v24.0+
docker-compose --version  # v2.0+
node --version           # v18+
npm --version            # v9+
```

#### 2. Descargar repositorio

```bash
git clone https://github.com/usuario/Docker_IAW.git
cd Docker_IAW
```

#### 3. Configurar variables de entorno

Crear archivo `.env` en la raíz (opcional, docker-compose usa valores por defecto):

```bash
NODE_ENV=development
DATABASE_HOST=db
DATABASE_PORT=5432
DATABASE_NAME=webstack
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
JWT_SECRET=tu_jwt_secret_aqui
```

#### 4. Construir e iniciar servicios

```bash
# Construir imágenes Docker
docker-compose build

# Iniciar todos los servicios
docker-compose up -d

# Verificar estado
docker-compose ps

# Ver logs
docker-compose logs -f
```

#### 5. Esperar inicialización

```bash
# PostgreSQL necesita ~3-5 segundos para iniciar
# Verificar que todos los servicios estén "healthy"
docker ps

# Ejemplo de salida esperada:
# STATUS: Up 2 minutes (healthy)
```

#### 6. Acceder a las aplicaciones

```
Frontend (React):        http://localhost:5173
API Gateway:             http://localhost:4000
Strapi CMS Admin:        http://localhost:1337/admin
PostgreSQL:              localhost:5432
```

#### 7. Parar servicios

```bash
# Pausar sin eliminar datos
docker-compose pause

# Reanudar
docker-compose unpause

# Detener
docker-compose down

# Detener y eliminar volúmenes (¡borra BD!)
docker-compose down -v
```

### Comandos Útiles de Docker Compose

```bash
# Ver logs de un servicio específico
docker-compose logs -f api-gateway
docker-compose logs -f db

# Acceder a terminal de un contenedor
docker exec -it Docker_IAW-db-1 psql -U postgres webstack

# Reiniciar un servicio
docker-compose restart product

# Escalar un servicio
docker-compose up -d --scale product=3

# Actualizar código y redeployar
git pull
docker-compose up -d --build
```

---

## Despliegue Kubernetes

### Requisitos

- **kubectl** instalado
- **Cluster Kubernetes** activo (EKS, GKE, AKS, minikube, kind)
- **Docker registry** (Docker Hub, ECR, GCR)
- **Imágenes Docker** construidas y pusheadas

### Pasos

Ver archivo completo: [DEPLOYMENT_KUBERNETES.md](DEPLOYMENT_KUBERNETES.md)

#### Resumen Rápido

```bash
# 1. Construir imágenes
docker build -t tu-usuario/product-service:latest services/product
docker push tu-usuario/product-service:latest
# (repetir para todos los servicios)

# 2. Desplegar manifiestos en orden
kubectl apply -f k8s/00-namespace.yaml
kubectl apply -f k8s/01-postgres.yaml
kubectl wait --for=condition=ready pod -l app=postgres -n webstack --timeout=300s
kubectl apply -f k8s/02-microservices.yaml
kubectl apply -f k8s/03-gateway.yaml
kubectl apply -f k8s/04-strapi.yaml
kubectl apply -f k8s/05-frontend.yaml
kubectl apply -f k8s/06-ingress.yaml

# 3. Verificar
kubectl get svc -n webstack
kubectl logs -f deployment/api-gateway -n webstack
```

### Características de Kubernetes

| Componente | Configuración |
|-----------|---------------|
| **Namespace** | `webstack` |
| **Database** | StatefulSet PostgreSQL 1 réplica |
| **Microservicios** | 4 Deployments, 2 réplicas cada uno |
| **Gateway** | Deployment 2 réplicas, LoadBalancer |
| **Frontend** | Deployment 2 réplicas, LoadBalancer |
| **CMS** | Deployment 1 réplica, PersistentVolume 5Gi |
| **Storage** | 2 PVC (PostgreSQL 10Gi, Strapi 5Gi) |
| **Ingress** | nginx-ingress con ruta única |

---

## Despliegue Vercel

### Opción 1: Frontend only (Recomendado)

Ver archivo: [DEPLOYMENT_VERCEL.md](DEPLOYMENT_VERCEL.md)

```bash
# 1. Conectar repositorio GitHub a Vercel
# - Ir a vercel.com/dashboard
# - "New Project" → Seleccionar repositorio
# - Vercel detecta automáticamente Vite

# 2. Configurar variables
# VITE_API_URL = https://api.webstack.com

# 3. Deploy automático en cada push
git push origin main
```

**Resultado:** 
- Frontend en Vercel (CDN global)
- Backend puede estar en Kubernetes, Render, Railway, etc.

### Opción 2: Frontend + Strapi CMS

```bash
# 1. Database
# - Crear PostgreSQL en Vercel Postgres o Supabase
# - Copiar credenciales

# 2. Crear proyecto Vercel para Strapi
# - Root Directory: services/cms
# - Environment Variables: DATABASE_*, JWT_*
# - Deploy

# 3. Conectar Frontend a Strapi
# VITE_API_URL = https://strapi-{id}.vercel.app
```

---

## Endpoints de la API

### Health Check

```bash
GET /health

# Response: 200 OK
{
  "status": "OK",
  "service": "gateway"
}
```

### Productos

```bash
# Listar productos
GET /products

# Crear producto
POST /products
{
  "name": "Laptop",
  "description": "High-performance laptop",
  "price": 999.99,
  "stock": 10
}

# Response: 201 Created
{
  "id": 1,
  "name": "Laptop",
  "description": "High-performance laptop",
  "price": 999.99,
  "stock": 10
}
```

### Carrito

```bash
# Ver carrito
GET /cart

# Agregar al carrito
POST /cart
{
  "product_id": 1,
  "quantity": 2
}

# Response: 201 Created
{
  "id": 5,
  "product_id": 1,
  "quantity": 2
}
```

### Usuarios y Autenticación

```bash
# Crear usuario
POST /users
{
  "username": "john.doe",
  "password": "secure_password_123"
}

# Login
POST /login
{
  "username": "john.doe",
  "password": "secure_password_123"
}

# Response: 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john.doe"
  }
}
```

### Órdenes

```bash
# Listar órdenes
GET /orders

# Obtener orden por ID
GET /orders/550e8400-e29b-41d4-a716-446655440000

# Crear orden
POST /orders
{
  "user_id": 1,
  "items": [
    {"product_id": 1, "quantity": 2, "price": 999.99},
    {"product_id": 3, "quantity": 1, "price": 49.99}
  ],
  "total": 2049.97
}

# Response: 201 Created
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": 1,
  "items": [...],
  "total": 2049.97,
  "status": "pending",
  "created_at": "2024-01-15T10:30:00Z"
}

# Actualizar estado de orden
PATCH /orders/550e8400-e29b-41d4-a716-446655440000
{
  "status": "completed"
}

# Eliminar orden
DELETE /orders/550e8400-e29b-41d4-a716-446655440000
```

### CMS (Strapi)

```bash
# Admin dashboard
GET /cms/admin

# API de contenido
GET /cms/api/pages
GET /cms/api/blog-posts
GET /cms/api/products  # Productos desde CMS

# Crear contenido (requiere autenticación)
POST /cms/api/pages
Authorization: Bearer {token}
{
  "data": {
    "title": "About Us",
    "slug": "about-us",
    "content": "..."
  }
}
```

---

## Variables de Entorno

### Docker Compose

```bash
# db/init.sql - Variables de PostgreSQL
DATABASE_NAME=webstack
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
POSTGRES_HOST_AUTH_METHOD=trust

# services/*/  - Microservicios
NODE_ENV=development
PORT=4001  # varía según servicio
DATABASE_HOST=db
DATABASE_PORT=5432
DATABASE_NAME=webstack
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
JWT_SECRET=CHANGE_ME_IN_PRODUCTION

# services/gateway/
PORT=4000
PRODUCT_SERVICE_URL=http://product:4001
CART_SERVICE_URL=http://cart:4002
USER_SERVICE_URL=http://user:4003
ORDERS_SERVICE_URL=http://orders:4004
CMS_SERVICE_URL=http://cms:1337

# services/cms/
STRAPI_HOST=0.0.0.0
STRAPI_PORT=1337
DATABASE_CLIENT=sqlite (en dev), postgres (en prod)
JWT_SECRET=...
ADMIN_JWT_SECRET=...
API_TOKEN_SALT=...

# frontend/
VITE_API_URL=http://localhost:4000  # Ajustar según ambiente
```

### Kubernetes

Variables definidas en `k8s/00-namespace.yaml`:

```yaml
ConfigMap: webstack-config
  NODE_ENV: production
  LOG_LEVEL: info

Secret: webstack-secrets
  DATABASE_URL: postgresql://user:pass@host/db
  DB_PASSWORD: postgres
  JWT_SECRET: ...
  STRAPI_JWT_SECRET: ...
  STRAPI_ADMIN_JWT_SECRET: ...
  STRAPI_API_TOKEN_SALT: ...
```

### Vercel

Configurar en dashboard **Settings → Environment Variables**:

```
Frontend:
  VITE_API_URL = https://api.webstack.com

Strapi CMS:
  DATABASE_HOST = ...
  DATABASE_NAME = ...
  DATABASE_USERNAME = ...
  DATABASE_PASSWORD = ...
  JWT_SECRET = ...
  ADMIN_JWT_SECRET = ...
  API_TOKEN_SALT = ...
  NODE_ENV = production
```

---

## Troubleshooting

### Docker Compose

**Problema:** Contenedores no inician
```bash
# Ver logs
docker-compose logs

# Verificar puertos disponibles
lsof -i :5173  # Frontend
lsof -i :4000  # Gateway

# Eliminar volúmenes corruptos
docker-compose down -v
docker-compose up -d --build
```

**Problema:** BD no inicializa
```bash
# Reiniciar servicios de BD
docker-compose restart db
docker-compose logs -f db

# Verificar archivos SQL
ls -la db/init.sql
```

### Kubernetes

**Problema:** Pods no inician
```bash
kubectl describe pod <pod-name> -n webstack
kubectl logs <pod-name> -n webstack
kubectl get events -n webstack
```

**Problema:** Sin conectividad
```bash
# Verificar servicios
kubectl get svc -n webstack

# Probar conectividad DNS
kubectl exec -it <pod> -n webstack -- nslookup postgres
```

### Vercel

**Problema:** Build falló
```
- Verificar que package.json tenga dependencias correctas
- Ver logs en Vercel Dashboard → Deployments
- Asegurar que .env variables están configuradas
```

**Problema:** API no responde
```
- Verificar que VITE_API_URL apunta al API Gateway correcto
- Configurar CORS en el backend
- Verificar credenciales de BD
```

---

## Documentación Detallada

Para información completa, ver:

- **Despliegue Kubernetes:** [DEPLOYMENT_KUBERNETES.md](DEPLOYMENT_KUBERNETES.md)
- **Despliegue Vercel:** [DEPLOYMENT_VERCEL.md](DEPLOYMENT_VERCEL.md)
- **Arquitectura y Decisiones:** [MICROSERVICIOS.md](MICROSERVICIOS.md)
- **Correcciones Aplicadas:** [CORRECCIONES.md](CORRECCIONES.md)

## Soporte

Para preguntas o issues:

1. Revisar archivos de documentación
2. Ejecutar `docker-compose logs`
3. Crear issue en GitHub (si aplica)
4. Contactar al administrador del proyecto

---

**Última actualización:** 2024-01-15  
**Versión:** 1.0 (Producción)  
**Estado:** ✅ Funcional en Docker Compose, Kubernetes e Ingreso en Vercel
