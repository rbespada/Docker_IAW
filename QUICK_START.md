# Quick Start Guide - WebStack

Inicia el proyecto localmente en 10 minutos.

## 📦 Requisitos

```bash
# Verificar versiones mínimas
docker --version   # v24.0+
docker-compose --version  # v2.0+
```

## 🚀 Iniciar en 5 pasos

### 1️⃣ Clonar y acceder

```bash
git clone https://github.com/usuario/Docker_IAW.git
cd Docker_IAW
```

### 2️⃣ Construir servicios

```bash
docker-compose build
```

**⏱️ Tiempo estimado:** 2-3 minutos

### 🛠️ Configurar CMS y base de datos

El CMS Strapi utiliza la misma PostgreSQL local. Puedes forzar el cliente PostgreSQL
estableciendo la variable `DATABASE_CLIENT=postgres` en tu archivo `.env`
antes de arrancar. Al iniciar por primera vez Strapi creará los roles
`Administrator`, `Manager` y `Customer` y un usuario `admin` con contraseña
`admin123` (recambia inmediatamente tras login).


### 3️⃣ Iniciar servicios

```bash
docker-compose up -d
```

**Espera a que todos los servicios estén listos:**
```bash
docker-compose ps
```

### 4️⃣ Verificar servicios

```bash
# Frontend
curl http://localhost:5173

# API Gateway
curl http://localhost:4000/health

# Strapi CMS
curl http://localhost:1337/admin
```

### 5️⃣ Acceder a las apps

| Servicio | URL |
|----------|-----|
| Frontend React | http://localhost:5173 |
| API Gateway | http://localhost:4000 |
| Strapi Admin | http://localhost:1337/admin |
| PostgreSQL | localhost:5432 |

---

## 🧪 Probar APIs

### Health Check

```bash
curl http://localhost:4000/health
```

### Listar Productos

```bash
curl http://localhost:4000/products
```

### Crear Producto

```bash
curl -X POST http://localhost:4000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Laptop",
    "description": "Modern laptop",
    "price": 1299.99,
    "stock": 20
  }'
```

### Crear Usuario

```bash
curl -X POST http://localhost:4000/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john.doe",
    "password": "secure123"
  }'
```

### Login

```bash
curl -X POST http://localhost:4000/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john.doe",
    "password": "secure123"
  }'
```

### Crear Orden

```bash
curl -X POST http://localhost:4000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "items": [
      {"product_id": 1, "quantity": 2, "price": 1299.99}
    ],
    "total": 2599.98,
    "status": "pending"
  }'
```

---

## 🛠️ Comandos Útiles

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f api-gateway

# Acceder a terminal de PostgreSQL
docker exec -it Docker_IAW-db-1 psql -U postgres webstack

# Detener servicios
docker-compose down

# Detener y limpiar datos
docker-compose down -v

# Reiniciar un servicio
docker-compose restart product

# Actualizar código y redeployar
git pull
docker-compose up -d --build
```

---

## 📂 Estructura del Proyecto

```
Docker_IAW/
├── frontend/              # React + Vite SPA
├── services/
│   ├── product/          # Catálogo de productos
│   ├── cart/             # Carrito de compras
│   ├── user/             # Usuarios y autenticación
│   ├── orders/           # Sistema de órdenes
│   ├── gateway/          # API Gateway (proxy)
│   └── cms/              # Strapi CMS
├── db/
│   └── init.sql          # Schema de base de datos
├── k8s/                  # Manifiestos Kubernetes
├── docker-compose.yml    # Configuración local
└── README.md
```

---

## 🔧 Troubleshooting

### ❌ Puertos ocupados

```bash
# Ver qué proceso usa el puerto
lsof -i :5173  # Frontend
lsof -i :4000  # Gateway
lsof -i :5432  # PostgreSQL

# Liberar puerto (si es seguro)
kill -9 <PID>
```

### ❌ La BD no inicializa

```bash
# Limpiar volúmenes y reintentar
docker-compose down -v
docker-compose up -d
```

### ❌ Los servicios no se conectan

```bash
# Ver logs de errores de conexión
docker-compose logs db
docker-compose logs product

# Reiniciar todos
docker-compose restart
```

### ❌ Cambios de código no se reflejan

```bash
# Reconstruir sin caché
docker-compose up -d --build --no-cache
```

---

## 📚 Documentación Completa

Para despliegue en producción y configuraciones avanzadas:

- **Kubernetes:** Ver [DEPLOYMENT_KUBERNETES.md](DEPLOYMENT_KUBERNETES.md)
- **Vercel:** Ver [DEPLOYMENT_VERCEL.md](DEPLOYMENT_VERCEL.md)
- **Resumen General:** Ver [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)
- **Arquitectura:** Ver [MICROSERVICIOS.md](MICROSERVICIOS.md)

---

## ✅ Checklist

Después de `docker-compose up -d`:

- [ ] Frontend carga en http://localhost:5173
- [ ] API Gateway responde en http://localhost:4000/health
- [ ] Strapi admin en http://localhost:1337/admin
- [ ] Base de datos con 5 productos de ejemplo
- [ ] Puedo crear usuarios y hacer login
- [ ] Puedo crear órdenes
- [ ] Todos los logs sin errores críticos

¡Listo! 🎉 Ahora puedes empezar a desarrollar.

---

**Tiempo total:** ~10 minutos  
**Requisitos de espacio:** ~2GB  
**Requisitos de RAM:** ~2GB (mínimo 4GB recomendado)
