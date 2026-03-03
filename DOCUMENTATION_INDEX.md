# 📚 Documentación WebStack - Índice Completo

Guía de navegación para toda la documentación del proyecto WebStack.

---

## 🚀 Inicio Rápido (Comienza Aquí)

| Documento | Tiempo | Descripción |
|-----------|--------|------------|
| **[QUICK_START.md](QUICK_START.md)** | ⏱️ 10 min | Inicia el proyecto localmente en 5 pasos |
| **[DEPLOY_CHECKLIST.md](DEPLOY_CHECKLIST.md)** | ⏱️ Referencia | Checklist completo para todos los ambientes |
| **[DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)** | ⏱️ 20 min | Resumen ejecutivo de todos los despliegues |

---

## 📖 Documentación Detallada

### Despliegue Local

**[DEPLOYMENT_KUBERNETES.md](DEPLOYMENT_KUBERNETES.md)** ← IGNORA (Kubernetes)
→ Para despliegue local, ir a:
- **[QUICK_START.md](QUICK_START.md)** - Versión rápida
- **[docker-compose.yml](docker-compose.yml)** - Configuración de servicios
- **[db/init.sql](db/init.sql)** - Schema de base de datos

### Despliegue en Kubernetes

- **[DEPLOYMENT_KUBERNETES.md](DEPLOYMENT_KUBERNETES.md)** - Guía completa (10,000+ palabras)
  - Preparación de environments
  - Construcción de imágenes Docker
  - Aplicación de manifiestos YAML
  - Troubleshooting avanzado
  - Backup y persistencia

**Manifiestos Kubernetes** (ordenados por aplicación):
```
k8s/
├── 00-namespace.yaml              # Namespace, ConfigMap, Secrets
├── postgres-init-configmap.yaml   # Inicialización de BD
├── 01-postgres.yaml               # Base de datos PostgreSQL
├── 02-microservices.yaml          # Product, Cart, User, Orders
├── 03-gateway.yaml                # API Gateway
├── 04-strapi.yaml                 # Strapi CMS
├── 05-frontend.yaml               # Frontend React
└── 06-ingress.yaml                # Nginx Ingress (optional)
```

### Despliegue en Vercel

- **[DEPLOYMENT_VERCEL.md](DEPLOYMENT_VERCEL.md)** - Guía Vercel (5,000+ palabras)
  - Despliegue de Frontend
  - Despliegue de Strapi CMS
  - Configuración de base de datos (Vercel Postgres/Supabase)
  - Serverless Functions
  - Dominios personalizados

---

## 🏗️ Arquitectura y Diseño

### Visiones de Alto Nivel

- **[DIAGRAMA_ARQUITECTURA.md](DIAGRAMA_ARQUITECTURA.md)** - Diagramas ASCII de la arquitectura
- **[ESTRUCTURA_PROYECTO.txt](ESTRUCTURA_PROYECTO.txt)** - Árbol de carpetas completo
- **[MICROSERVICIOS.md](MICROSERVICIOS.md)** - Decisiones de arquitectura

### Responsabilidades Microservicios

| Servicio | Puerto | Responsabilidad | Tecnología |
|----------|--------|-----------------|-----------|
| **Frontend** | 5173 | SPA React | React 18 + Vite |
| **API Gateway** | 4000 | Proxy reverso | Express.js |
| **Product** | 4001 | Catálogo de productos | Node.js + PostgreSQL |
| **Cart** | 4002 | Carrito de compras | Node.js + PostgreSQL |
| **User** | 4003 | Autenticación | Node.js + bcrypt + JWT |
| **Orders** | 4004 | Sistema de órdenes | Node.js + PostgreSQL + UUID |
| **CMS** | 1337 | Gestor de contenidos | Strapi 4.13.2 |
| **Database** | 5432 | Persistencia | PostgreSQL 15 |

---

## ✅ Correcciones y Mejoras

- **[CORRECCIONES.md](CORRECCIONES.md)** - Bugs encontrados y solucionados
- **[ESTADO_PROYECTO.md](ESTADO_PROYECTO.md)** - Estado actual y roadmap

---

## 🔧 Referencia Técnica

### Configuración de Servicios

```
services/
├── product/           # src/index.js, Dockerfile, package.json
├── cart/             # src/index.js, Dockerfile, package.json
├── user/             # src/index.js, Dockerfile, package.json
├── orders/           # index.js, Dockerfile, package.json (NUEVO)
├── gateway/          # index.js, Dockerfile, package.json
│   └── Rutas a: /products, /cart, /users, /orders, /cms
└── cms/              # Strapi (NUEVO)
    ├── package.json
    ├── src/config/   # database.js, server.js, middlewares.js, plugins.js
    ├── Dockerfile
    └── .env.example
```

### Variables de Entorno por Ambiente

**Desarrollo Local** (`.env` en raíz)
```
NODE_ENV=development
DATABASE_HOST=db
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
JWT_SECRET=your-secret
```

**Kubernetes** (`k8s/00-namespace.yaml`)
```
ConfigMap: webstack-config
  NODE_ENV=production
  LOG_LEVEL=info

Secret: webstack-secrets
  DATABASE_URL=postgresql://...
  JWT_SECRET=...
```

**Vercel** (Dashboard Settings → Environment Variables)
```
VITE_API_URL=https://api.example.com
DATABASE_HOST=...
DATABASE_PASSWORD=...
JWT_SECRET=...
```

---

## 🧪 Testing y Validación

### Endpoints Disponibles

**Health Check**
```bash
GET /health
```

**Productos**
```bash
GET /products
POST /products
```

**Carrito**
```bash
GET /cart
POST /cart
```

**Usuarios**
```bash
POST /users
POST /login
```

**Órdenes**
```bash
GET /orders
POST /orders
PATCH /orders/:id
DELETE /orders/:id
```

**CMS**
```bash
GET /cms/admin
GET /cms/api/pages
```

Ver ejemplos completos en **[DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md#endpoints-de-la-api)**

---

## 📊 Dashboards y Monitoreo

### Docker Compose
```bash
docker-compose ps              # Ver estado
docker-compose logs -f         # Ver logs en tiempo real
docker stats                   # Ver uso de recursos
```

### Kubernetes
```bash
kubectl get pods -n webstack              # Ver pods
kubectl logs -f deployment/api-gateway    # Ver logs
kubectl top pods -n webstack              # Ver recursos
kubectl describe pod <pod-name> -n webstack  # Ver detalles
```

### Vercel
```
vercel.com/dashboard
  → Proyecto
    → Deployments (ver historial)
    → Logs (ver output en tiempo real)
    → Analytics (métricas de rendimiento)
```

---

## 🆘 Troubleshooting

### Problemas Comunes

| Problema | Solución | Documento |
|----------|----------|-----------|
| Contenedores no inician | Ver logs, limpiar volúmenes | DEPLOYMENT_SUMMARY.md |
| BD sin conectar | Esperar a PostgreSQL, verificar credenciales | QUICK_START.md |
| Puertos ocupados | Cambiar en docker-compose.yml o liberar puertos | QUICK_START.md |
| K8s sin conectar | Verificar kubeconfig, contexto | DEPLOYMENT_KUBERNETES.md |
| Vercel build fallido | Revisar logs, variables de entorno | DEPLOYMENT_VERCEL.md |
| CORS errors | Configurar headers en Gateway | DEPLOYMENT_KUBERNETES.md |

---

## 📁 Archivos Importantes

### Configuración Principal
```
docker-compose.yml          # Orquestación local
db/init.sql                 # Schema de base de datos
package.json (raíz)         # Dependencias monorepo (si aplica)
```

### Dockerfiles
```
frontend/Dockerfile         # React + Vite
services/*/Dockerfile       # Cada microservicio
services/cms/Dockerfile     # Strapi
```

### Kubernetes Manifests
```
k8s/00-namespace.yaml       # Namespace + ConfigMap + Secret
k8s/01-postgres.yaml        # Base de datos
k8s/02-microservices.yaml   # 4 microservicios
k8s/03-gateway.yaml         # API Gateway
k8s/04-strapi.yaml          # CMS
k8s/05-frontend.yaml        # Frontend
k8s/06-ingress.yaml         # Routing unificado (opcional)
```

### Vercel Config
```
frontend/vercel.json        # Frontend build config
services/cms/vercel.json    # Strapi build config
```

---

## 🎯 Flujos de Trabajo

### Desarrollo Local
1. Modificar código en `services/` o `frontend/`
2. `docker-compose up -d --build` (reconstruir cambios)
3. Acceder a http://localhost:5173
4. Ver logs: `docker-compose logs -f`

### Deploy a Kubernetes
1. Preparar imágenes Docker (`docker build` + `docker push`)
2. Actualizar manifiestos (`image:` con tu registry)
3. Aplicar en orden: `kubectl apply -f k8s/00-namespace.yaml` → `01-postgres.yaml` → ...
4. Verificar: `kubectl get svc -n webstack`

### Deploy a Vercel
1. Push a GitHub: `git push origin main`
2. Dashboard Vercel: "New Project" → Import repo
3. Configurar variables de entorno
4. Click "Deploy"
5. Acceder a URL generada

---

## 🚦 Estado del Proyecto

### Completado ✅
- [x] Arquitectura de microservicios
- [x] 6 servicios funcionales (Product, Cart, User, Orders, Gateway, CMS)
- [x] PostgreSQL con schema completo
- [x] Docker Compose con todos los servicios
- [x] Frontend React + Vite
- [x] Manifiestos Kubernetes (deployment-ready)
- [x] Vercel integration (frontend + Strapi)
- [x] Documentación completa

### Ready for Production 🚀
Los siguientes ambientes están listos para producción:
- ✅ **Docker Compose** - Development/Testing
- ✅ **Kubernetes** - Scaling/HA
- ✅ **Vercel** - Serverless/CDN

### Enhancements Futuros 🔮
- [ ] Message Queue (RabbitMQ/Redis)
- [ ] Caché distribuida
- [ ] Elasticsearch para búsqueda
- [ ] Autenticación OAuth2/Social
- [ ] Pagos integrados (Stripe)
- [ ] CI/CD con GitHub Actions

---

## 📞 Referencia Rápida

### Comandos Más Usados

```bash
# Docker Compose
docker-compose up -d                    # Iniciar
docker-compose down                     # Detener
docker-compose logs -f api-gateway      # Ver logs

# Kubernetes
kubectl apply -f k8s/                   # Desplegar
kubectl get pods -n webstack            # Ver estado
kubectl delete namespace webstack       # Limpiar

# Testing
curl http://localhost:4000/health       # Health check local
curl https://api.vercel.app/health      # Health check prod
```

### URLs por Ambiente

| Componente | Local | Kubernetes | Vercel |
|-----------|-------|-----------|--------|
| Frontend | :5173 | LoadBalancer IP | vercel.app |
| API | :4000 | LoadBalancer IP | vercel.app/api |
| CMS | :1337 | LoadBalancer IP | vercel.app/cms |
| BD | :5432 | postgres:5432 | Vercel Postgres |

---

## 📚 Orden de Lectura Recomendado

**Para Principiantes:**
1. [QUICK_START.md](QUICK_START.md) - 10 minutos
2. [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md#arquitectura-del-sistema) - Lee sección de arquitectura
3. [DIAGRAMA_ARQUITECTURA.md](DIAGRAMA_ARQUITECTURA.md) - Visualizar sistema

**Para Desarrolladores:**
1. [MICROSERVICIOS.md](MICROSERVICIOS.md) - Entender decisiones
2. [ESTRUCTURA_PROYECTO.txt](ESTRUCTURA_PROYECTO.txt) - Conocer carpetas
3. [services/*/index.js](services/) - Leer código

**Para DevOps/SRE:**
1. [DEPLOYMENT_KUBERNETES.md](DEPLOYMENT_KUBERNETES.md) - Guía K8s
2. [DEPLOYMENT_VERCEL.md](DEPLOYMENT_VERCEL.md) - Guía Vercel
3. [DEPLOY_CHECKLIST.md](DEPLOY_CHECKLIST.md) - Validación

**Para Presentación/Demo:**
1. [QUICK_START.md](QUICK_START.md) - Setup rápido
2. [GUIA_PRESENTACION.md](GUIA_PRESENTACION.md) - Demo script
3. [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md#endpoints-de-la-api) - Ejemplos API

---

## 🔗 Enlaces Externos

- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Vercel Documentation](https://vercel.com/docs)
- [Strapi Documentation](https://strapi.io/documentation/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)

---

**Último actualizado:** 2024-01-15  
**Versión del Proyecto:** 1.0 - Producción Ready  
**Mantenedor:** Tu equipo de desarrollo

¿Necesitas ayuda? Consulta los documentos específicos o revisa troubleshooting.
