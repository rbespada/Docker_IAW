# Guía de Despliegue y Testing - WebStack Microservicios

## Tabla de Contenidos
1. [Requisitos Previos](#requisitos-previos)
2. [Despliegue Local](#despliegue-local)
3. [Testing de Servicios](#testing-de-servicios)
4. [Solución de Problemas](#solución-de-problemas)
5. [Comandos Útiles](#comandos-útiles)

---

## Requisitos Previos

### Software Requerido
- **Docker:** 20.10 o superior
- **Docker Compose:** 1.29 o superior
- **Git:** Cualquier versión reciente
- **curl:** Para testing de endpoints (opcional, puede usar Postman)

### Verificación de Prerequisitos
```bash
# Verificar Docker
docker --version
# Esperado: Docker version 20.10.x+

# Verificar Docker Compose
docker-compose --version
# Esperado: docker-compose version 1.29.x+

# Verificar Git
git --version
# Esperado: git version 2.x+
```

### Estructura de Directorios
```
/workspaces/Docker_IAW/
├── doc/
│   ├── ARQUITECTURA.md           (Fase 1 - Monolito)
│   ├── MICROSERVICIOS.md         (Fase 2 - Documentación actual)
│   ├── RESUMEN_EJECUTIVO.md
│   └── CHECKLISTS.md
├── services/
│   ├── product/
│   │   ├── package.json
│   │   ├── index.js
│   │   └── Dockerfile
│   ├── cart/
│   │   ├── package.json
│   │   ├── index.js
│   │   └── Dockerfile
│   ├── user/
│   │   ├── package.json
│   │   ├── index.js
│   │   └── Dockerfile
│   ├── gateway/
│   │   ├── package.json
│   │   ├── index.js
│   │   └── Dockerfile
│   └── .env.example
├── frontend/
│   ├── package.json
│   ├── Dockerfile
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── api.js
│   └── index.html
├── db/
│   └── init.sql
├── docker-compose.yml
└── README.md
```

---

## Despliegue Local

### Paso 1: Preparación del Entorno

```bash
# Acceder al directorio del proyecto
cd /workspaces/Docker_IAW

# Verificar que existen los archivos críticos
ls -la docker-compose.yml
ls -la db/init.sql
ls -la services/*/Dockerfile
ls -la frontend/Dockerfile

# (Opcional) Ver el estado actual de Docker
docker ps          # Contenedores en ejecución
docker images      # Imágenes disponibles
```

### Paso 2: Construir las Imágenes

```bash
# Construir todas las imágenes definidas en docker-compose.yml
docker-compose build

# Output esperado:
# Building db ... done
# Building product ... done
# Building cart ... done
# Building user ... done
# Building gateway ... done
# Building frontend ... done
```

**Tiempo esperado:** 5-10 minutos en primera ejecución

**Nota:** Las imágenes se cachean, ejecuciones subsecuentes serán más rápidas.

### Paso 3: Iniciar los Servicios

#### Opción A: Despliegue en Background (Recomendado)

```bash
# Iniciar todos los servicios
docker-compose up -d

# Verificar que todos arrancan
docker-compose ps

# Ver logs iniciales
docker-compose logs --tail=20
```

#### Opción B: Despliegue en Foreground (Para debugging)

```bash
# Permite ver logs en tiempo real de todos los servicios
docker-compose up

# Presionar Ctrl+C para detener (servicios seguirán corriendo en background)
```

### Paso 4: Verificación Inicial

```bash
# Esperar ~30 segundos a que la BD se inicialice
sleep 30

# Verificar estado de todos los servicios
docker-compose ps

# Salida esperada:
# NAME                COMMAND                STATUS          PORTS
# webstack_db         "docker-entrypoint.s…" Up (healthy)   5432/tcp
# webstack_product    "node index.js"        Up              4001/tcp
# webstack_cart       "node index.js"        Up              4002/tcp
# webstack_user       "node index.js"        Up              4003/tcp
# webstack_gateway    "node index.js"        Up              0.0.0.0:4000->4000/tcp
# webstack_frontend   "npm run dev"          Up              0.0.0.0:5173->5173/tcp
```

**Estados esperados:**
- `db`: `Up (healthy)` - PostgreSQL inicializada
- Otros servicios: `Up` - Contenedores corriendo
- Puertos: Mostrados para gateway (4000) y frontend (5173)

---

## Testing de Servicios

### Testing del API Gateway

El gateway actúa como punto de entrada único. Accesible en `http://localhost:4000`

#### 1. Health Check del Gateway

```bash
curl -X GET http://localhost:4000/health

# Respuesta esperada:
# {"status":"OK"}
```

### Testing del Servicio de Productos

#### 2. Listar Todos los Productos

```bash
curl -X GET http://localhost:4000/products

# Respuesta esperada (200 OK):
[
  {
    "id": 1,
    "name": "Laptop Dell XPS",
    "description": "Laptop de rendimiento superior",
    "price": "999.99",
    "stock": 5,
    "created_at": "2024-01-15T10:30:00.000Z"
  },
  {
    "id": 2,
    "name": "Mouse Logitech",
    "description": "Mouse inalámbrico de precisión",
    "price": "29.99",
    "stock": 20,
    "created_at": "2024-01-15T10:30:00.000Z"
  },
  ...
]
```

#### 3. Crear un Nuevo Producto

```bash
curl -X POST http://localhost:4000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Monitor Samsung Curvo",
    "description": "Monitor gaming 27 pulgadas",
    "price": 389.99,
    "stock": 7
  }'

# Respuesta esperada (201 Created):
{
  "id": 6,
  "name": "Monitor Samsung Curvo",
  "description": "Monitor gaming 27 pulgadas",
  "price": "389.99",
  "stock": 7,
  "created_at": "2024-01-15T14:45:00.000Z"
}
```

### Testing del Servicio de Carrito

#### 4. Obtener Carrito Actual

```bash
curl -X GET http://localhost:4000/cart

# Respuesta esperada (200 OK):
# Array vacío [] si es carrito nuevo,
# O con items si existen:
[
  {
    "id": 1,
    "product_id": 1,
    "quantity": 2,
    "name": "Laptop Dell XPS",
    "price": "999.99",
    "created_at": "2024-01-15T11:00:00.000Z"
  }
]
```

#### 5. Añadir Item al Carrito

```bash
curl -X POST http://localhost:4000/cart \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 2,
    "quantity": 3
  }'

# Respuesta esperada (201 Created):
{
  "id": 2,
  "product_id": 2,
  "quantity": 3,
  "created_at": "2024-01-15T11:15:00.000Z"
}
```

#### 6. Verificar que el Item se agregó

```bash
curl -X GET http://localhost:4000/cart

# Respuesta esperada:
# Debe incluir el nuevo item con detalles del producto
```

### Testing del Servicio de Usuarios

#### 7. Registrar un Nuevo Usuario

```bash
curl -X POST http://localhost:4000/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "juan.perez",
    "password": "SecurePass123!"
  }'

# Respuesta esperada (201 Created):
{
  "id": 1,
  "username": "juan.perez"
}

# Nota: La contraseña NO se retorna (está hasheada en BD)
```

#### 8. Intentar Registrar Usuario Duplicado

```bash
curl -X POST http://localhost:4000/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "juan.perez",
    "password": "AnotherPassword!"
  }'

# Respuesta esperada (409 Conflict):
{
  "error": "Username already exists"
}
```

#### 9. Autenticar Usuario (Login)

```bash
curl -X POST http://localhost:4000/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "juan.perez",
    "password": "SecurePass123!"
  }'

# Respuesta esperada (200 OK):
{
  "id": 1,
  "username": "juan.perez",
  "message": "Login successful"
}
```

#### 10. Login con Contraseña Incorrecta

```bash
curl -X POST http://localhost:4000/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "juan.perez",
    "password": "WrongPassword123!"
  }'

# Respuesta esperada (401 Unauthorized):
{
  "error": "Invalid credentials"
}
```

### Testing del Frontend

#### 11. Acceder a la Interfaz Web

```bash
# Abrir en navegador
open http://localhost:5173

# O desde línea de comandos
curl http://localhost:5173
```

**Verificar:**
- ✓ Página carga correctamente
- ✓ Se muestran los productos (5 precargados)
- ✓ Cada producto muestra: nombre, descripción, precio, stock
- ✓ Botón "Añadir al carrito" es clicable
- ✓ No hay errores en la consola (F12 > Console)

---

## Solución de Problemas

### Problema 1: Los Servicios No Inician

**Síntomas:**
```bash
docker-compose ps
# Servicios mostrados como "Exited"
```

**Solución:**
```bash
# Ver logs detallados del servicio problemático
docker-compose logs product

# Usuales causas:
# 1. Puerto ya en uso
# 2. Archivo no encontrado
# 3. Variable de entorno no configurada

# Reintentar construcción e inicio limpio
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Problema 2: "Cannot reach database" en Microservicios

**Síntomas:**
```
Error: connect ECONNREFUSED db:5432
```

**Solución:**
```bash
# La BD necesita tiempo para inicializarse
# Esperar 30 segundos y reintentar
sleep 30

# Verificar que la BD está healthy
docker-compose ps db

# Si no aparece como (healthy):
docker-compose logs db

# Reiniciar la BD
docker-compose restart db
sleep 10
```

### Problema 3: Puerto 4000/5173 ya en uso

**Síntomas:**
```
Error: port 4000 is already in use
```

**Solución:**
```bash
# Encontrar proceso usando el puerto
lsof -i :4000

# Opción 1: Matar el proceso
kill -9 <PID>

# Opción 2: Cambiar el puerto en docker-compose.yml
# Modificar línea: - "4001:4000" en lugar de - "4000:4000"

# Opción 3: Detener contenedores previos
docker-compose down
```

### Problema 4: Los datos de la BD se pierden al reiniciar

**Esto es normal si usaste `docker-compose down -v`**

**Solución:**
```bash
# Usar solo `down` sin `-v` para preservar volúmenes
docker-compose stop   # Detiene sin eliminar
docker-compose start  # Reinicia servicios

# Llenar BD con datos iniciales nuevamente
docker-compose exec db psql -U postgres -d webstack -f /docker-entrypoint-initdb.d/init.sql
```

### Problema 5: Errores de conexión desde Frontend

**Síntomas:**
```
ERR_FAILED (en consola de navegador)
Mixed Content: The page was loaded over HTTPS, but requested an insecure resource
```

**Solución:**
```bash
# Verificar que el gateway está corriendo
docker-compose ps gateway

# Probar endpoint del gateway
curl http://localhost:4000/products

# En archivo frontend/src/api.js, usar URL correcta:
# const API_URL = 'http://localhost:4000';  (desarrollo)
# const API_URL = 'https://api.tudominio.com';  (producción)
```

---

## Comandos Útiles

### Gestión General

```bash
# Ver estado de todos los servicios
docker-compose ps

# Ver logs de todos (últimas 20 líneas)
docker-compose logs --tail=20

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f product
docker-compose logs -f gateway
docker-compose logs -f db
```

### Iniciar/Detener/Reiniciar

```bash
# Iniciar servicios
docker-compose up -d

# Detener servicios (mantiene volúmenes de datos)
docker-compose stop

# Detener e eliminar contenedores
docker-compose down

# Detener, eliminar contenedores Y volúmenes (borra datos)
docker-compose down -v

# Reiniciar todos los servicios
docker-compose restart

# Reiniciar un servicio específico
docker-compose restart product
docker-compose restart gateway
```

### Debugging

```bash
# Acceder a shell en contenedor
docker-compose exec db psql -U postgres

# Dentro de psql:
\l              # Listar bases de datos
\dt             # Listar tablas
SELECT * FROM products;  # Query de ejemplo
\q              # Salir

# Acceder a Node.js en contenedor
docker-compose exec product sh
# Dentro del contenedor: npm list, tail logs, etc.

# Ver recursos consumidos en tiempo real
docker stats $(docker ps --format '{{.Names}}' | grep webstack)

# Ver variables de entorno de un servicio
docker-compose exec product env | grep DATABASE
```

### Limpiar y Reconstruir

```bash
# Limpiar imágenes no usadas
docker image prune -a

# Reconstruir sin caché (fuerza renovación)
docker-compose build --no-cache

# Reconstruir solo un servicio
docker-compose build --no-cache product

# Eliminar volúmenes y reiniciar desde cero
docker-compose down -v
docker-compose build
docker-compose up -d
sleep 30
docker-compose ps
```

### Testing Rápido (Suite Completa)

```bash
#!/bin/bash
# Guardar como test_all.sh y ejecutar: bash test_all.sh

echo "=== Testing WebStack Microservicios ==="

echo -e "\n1. Health Check"
curl -s http://localhost:4000/health | jq .

echo -e "\n2. Listar Productos"
curl -s http://localhost:4000/products | jq '.[0]'

echo -e "\n3. Crear Producto"
curl -s -X POST http://localhost:4000/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","price":99.99,"stock":10}' | jq .

echo -e "\n4. Obtener Carrito"
curl -s http://localhost:4000/cart | jq .

echo -e "\n5. Añadir al Carrito"
curl -s -X POST http://localhost:4000/cart \
  -H "Content-Type: application/json" \
  -d '{"productId":1,"quantity":2}' | jq .

echo -e "\n6. Registrar Usuario"
curl -s -X POST http://localhost:4000/users \
  -H "Content-Type: application/json" \
  -d '{"username":"test.user","password":"TestPass123"}' | jq .

echo -e "\n7. Login Usuario"
curl -s -X POST http://localhost:4000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test.user","password":"TestPass123"}' | jq .

echo -e "\n=== Testing Completado ==="
```

---

## Checklist de Validación

Completar esta lista después de desplegar:

- [ ] Docker y Docker Compose instalados y versión correcta
- [ ] Estructura de directorios correcta (`services/`, `frontend/`, `db/`)
- [ ] archivo `docker-compose.yml` presente y válido
- [ ] Archivo `db/init.sql` existe con tablas
- [ ] Todos los `Dockerfile` presentes (6 total)
- [ ] Imágenes construidas exitosamente (sin errores en `docker-compose build`)
- [ ] Servicios inician sin errores (`docker-compose up -d`)
- [ ] BD está `Up (healthy)` después de 30 segundos
- [ ] Gateway responde a `GET /health`
- [ ] Listar productos retorna datos (sin errores 500)
- [ ] Crear producto funciona (201 Created)
- [ ] Agregar a carrito funciona (201 Created)
- [ ] Registrar usuario funciona (201 Created)
- [ ] Login funciona con credenciales válidas (200 OK)
- [ ] Login falla con credenciales inválidas (401 Unauthorized)
- [ ] Frontend carga en `http://localhost:5173`
- [ ] Frontend muestra productos sin errores de consola
- [ ] Botón "Añadir al carrito" es funcional
- [ ] Documentación MICROSERVICIOS.md está actualizada
- [ ] Código está commiteado a Git

---

## Próximos Pasos

1. **Explorar Escalabilidad**
   - Aumentar réplicas de Product Service
   - Implementar load balancer (Nginx)

2. **Mejorar Seguridad**
   - Agregar JWT authentication
   - Implementar HTTPS/TLS
   - Validación de entrada en todos los servicios

3. **Observabilidad**
   - Integrar Prometheus para métricas
   - Agregar centralización de logs
   - Implementar tracing distribuido

4. **CI/CD**
   - Configurar GitHub Actions
   - Tests automáticos antes de merge
   - Despliegue automático a producción

---

**Última actualización:** Diciembre 2024  
**Versión:** 1.0
