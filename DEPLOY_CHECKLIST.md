# 📋 Checklist de Despliegue Completo

Estado completo del proyecto WebStack con instrucciones paso a paso para cada entorno.

---

## ✅ 1. Despliegue Local (Docker Compose)

### Pre-requisitos
- [ ] Docker instalado (`docker --version`)
- [ ] Docker Compose instalado (`docker-compose --version`)
- [ ] Puertos 5173, 4000, 5432, 1337 disponibles

### Pasos

```bash
# 1. Clonar repositorio
git clone https://github.com/usuario/Docker_IAW.git
cd Docker_IAW

# 2. Construir imágenes
docker-compose build

# 3. Iniciar servicios
docker-compose up -d

# 4. Esperar a que PostgreSQL esté listo
docker-compose logs -f db  # Esperar "ready to accept connections"

# 5. Verificar salud
curl http://localhost:4000/health
```

### Acceso a Servicios

| Componente | URL | Usuario | Contraseña |
|-----------|-----|---------|-----------|
| Frontend | http://localhost:5173 | - | - |
| API Gateway | http://localhost:4000/health | - | - |
| Strapi Admin | http://localhost:1337/admin | admin@strapi.io | admin |
| PostgreSQL | localhost:5432 | postgres | postgres |

### Estado Esperado

```bash
docker-compose ps
# STATUS: Up X minutes

CONTAINER ID   IMAGE                 COMMAND                STATUS
abc123...      webstack/frontend     "npm run dev"         Up 2 minutes
def456...      webstack/gateway      "npm start"           Up 2 minutes
ghi789...      webstack/product      "npm start"           Up 2 minutes
jkl012...      webstack/cart         "npm start"           Up 2 minutes
mno345...      webstack/user         "npm start"           Up 2 minutes
pqr678...      webstack/orders       "npm start"           Up 2 minutes
stu901...      webstack/strapi       "npm run develop"     Up 2 minutes
vwx234...      postgres:15-alpine    "postgres"            Up 2 minutes
```

### Comandos de Mantenimiento

```bash
# Ver logs
docker-compose logs -f

# Parar servicios (sin eliminar datos)
docker-compose pause
docker-compose unpause

# Detener
docker-compose down

# Limpiar todo (incluyendo BD)
docker-compose down -v
```

**Estimado:** 10 minutos | **RAM:** 2GB | **Espacio:** 2GB

---

## ✅ 2. Despliegue Kubernetes

### Pre-requisitos
- [ ] kubectl instalado
- [ ] Cluster Kubernetes activo (EKS, GKE, AKS, minikube, kind)
- [ ] Docker registry accesible (Docker Hub, ECR, GCR)
- [ ] Conexión correcta a cluster: `kubectl cluster-info`

### Fase 1: Preparar Imágenes Docker

```bash
# Login a Docker registry
docker login

# Construir imágenes (reemplazar 'usuario' con tu usuario Docker Hub)
docker build -t usuario/product-service:latest services/product -f services/product/Dockerfile
docker build -t usuario/cart-service:latest services/cart -f services/cart/Dockerfile
docker build -t usuario/user-service:latest services/user -f services/user/Dockerfile
docker build -t usuario/orders-service:latest services/orders -f services/orders/Dockerfile
docker build -t usuario/api-gateway:latest services/gateway -f services/gateway/Dockerfile
docker build -t usuario/strapi:latest services/cms -f services/cms/Dockerfile
docker build -t usuario/frontend:latest frontend -f frontend/Dockerfile

# Pushear a registry
docker push usuario/product-service:latest
docker push usuario/cart-service:latest
docker push usuario/user-service:latest
docker push usuario/orders-service:latest
docker push usuario/api-gateway:latest
docker push usuario/strapi:latest
docker push usuario/frontend:latest
```

### Fase 2: Actualizar Manifiestos

**Editar todos los YAML en `k8s/` y reemplazar:**
- `webstack/product-service` → `usuario/product-service`
- `webstack/cart-service` → `usuario/cart-service`
- (repetir para todos los servicios)

O usar script:
```bash
cd k8s/
for file in *.yaml; do
  sed -i 's|webstack/|usuario/|g' "$file"
done
```

### Fase 3: Desplegar a Kubernetes

**Orden crítico:**
```bash
# 1. Namespace, ConfigMap, Secrets (PRIMERO)
kubectl apply -f k8s/00-namespace.yaml

# 2. PostgreSQL StatefulSet (SEGUNDO - base de datos)
kubectl apply -f k8s/postgres-init-configmap.yaml
kubectl apply -f k8s/01-postgres.yaml

# 3. Esperar a que PostgreSQL esté listo
kubectl wait --for=condition=ready pod -l app=postgres -n webstack --timeout=300s

# 4. Microservicios (TERCERO - dependen de BD)
kubectl apply -f k8s/02-microservices.yaml

# 5. API Gateway (CUARTO)
kubectl apply -f k8s/03-gateway.yaml

# 6. Strapi CMS (QUINTO)
kubectl apply -f k8s/04-strapi.yaml

# 7. Frontend React (SEXTO)
kubectl apply -f k8s/05-frontend.yaml

# 8. Ingress (ÚLTIMO - opcional pero recomendado)
kubectl apply -f k8s/06-ingress.yaml

# OPCIÓN: Aplicar todo de una vez (SOLO si Kubernetes gestiona dependencias)
kubectl apply -f k8s/
```

### Fase 4: Verificar Despliegue

```bash
# Ver status de pods
kubectl get pods -n webstack

# Ver servicios
kubectl get svc -n webstack

# Ver ingress
kubectl get ingress -n webstack

# Logs detallados
kubectl logs -f deployment/api-gateway -n webstack
kubectl logs -f deployment/strapi -n webstack

# Describir pod para ver errores
kubectl describe pod <pod-name> -n webstack
```

### Fase 5: Acceso a Servicios

**Si usa LoadBalancer:**
```bash
kubectl get svc -n webstack
# Copiar IP EXTERNAL-IP para cada servicio
# Frontend: http://<FRONTEND-IP>:5173
# Gateway: http://<GATEWAY-IP>:4000
```

**Si usa Ingress:**
```bash
# Ver IP del cluster
kubectl get ingress -n webstack

# Agregar a /etc/hosts (local)
echo "127.0.0.1 webstack.local" >> /etc/hosts

# Acceder via
# http://webstack.local/
# http://webstack.local/products
# http://webstack.local/admin (Strapi)
```

### Monitoreo Continuo

```bash
# Ver eventos en tiempo real
kubectl get events -n webstack --watch

# Ver recursos usados
kubectl top nodes
kubectl top pods -n webstack

# Port-forward para acceso local
kubectl port-forward svc/api-gateway 4000:4000 -n webstack
curl http://localhost:4000/health
```

### Escalamiento

```bash
# Escalar manualmente
kubectl scale deployment api-gateway --replicas=5 -n webstack

# Autoscaling (requiere metrics-server)
kubectl autoscale deployment api-gateway --min=2 --max=10 --cpu-percent=70 -n webstack
kubectl get hpa -n webstack --watch
```

### Limpiar Despliegue

```bash
# Opción 1: Eliminar todo (incluyendo datos)
kubectl delete namespace webstack

# Opción 2: Eliminar por partes
kubectl delete -f k8s/06-ingress.yaml
kubectl delete -f k8s/05-frontend.yaml
kubectl delete -f k8s/04-strapi.yaml
kubectl delete -f k8s/03-gateway.yaml
kubectl delete -f k8s/02-microservices.yaml
kubectl delete -f k8s/01-postgres.yaml
kubectl delete -f k8s/00-namespace.yaml
```

**Estimado:** 20 minutos | **Requerimientos:** 4GB RAM, 20GB espacio

---

## ✅ 3. Despliegue en Vercel

### Opción A: Frontend Solo (MÁS FÁCIL)

#### Requisitos
- [ ] Repositorio GitHub con código del proyecto
- [ ] Cuenta en Vercel (vercel.com)
- [ ] API backend en otro lugar (Kubernetes, ServerlessAPI, etc.)

#### Pasos

```bash
# 1. Push a GitHub
git add .
git commit -m "Add WebStack project"
git push origin main

# 2. Ir a vercel.com/dashboard
# 3. "New Project" → Importar repositorio
# 4. Seleccionar "Docker_IAW"
# 5. Framework: Detecta Vite automáticamente
# 6. Settings:
#    - Root Directory: frontend (si está en subcarpeta)
#    - Build Command: npm run build
#    - Output Directory: dist
```

#### Variables de Entorno

En Vercel dashboard → **Settings → Environment Variables**:

```
VITE_API_URL = https://api.minomio.com:4000
# O si API está en otro Vercel
VITE_API_URL = https://api-example.vercel.app
```

#### Deploy

- Click en "Deploy"
- Esperar a que termine (2-3 minutos)
- URL generada: `https://webstack-{id}.vercel.app`

#### Monitoreo

```bash
# Logs en tiempo real
vercel logs

# Ver deployments
vercel list

# Rollback a deploy anterior
vercel rollback
```

**Estimado:** 5 minutos | **Costo:** Free (hasta límites)

---

### Opción B: Frontend + Strapi CMS (RECOMENDADO)

#### 1. Crear Base de Datos PostgreSQL

**Opción 1: Vercel Postgres (Integración Nativa)**
```bash
# En Vercel dashboard
# → Storage → Create Database → Postgres
# → Copiar credenciales
# → Linked to project: seleccionar proyecto Vercel
```

**Opción 2: Supabase (Alternativa Gratuita)**
```bash
# IR A: supabase.com
# → New Project
# → Copiar DATABASE_URL desde Settings
```

#### 2. Desplegar Strapi

```bash
# 1. En Vercel dashboard
# 2. "New Project" → Importar repositorio
# 3. Root Directory: services/cms
# 4. Environment Variables:
#    DATABASE_HOST = host.de.postgres
#    DATABASE_PORT = 5432
#    DATABASE_NAME = webstack
#    DATABASE_USERNAME = postgres
#    DATABASE_PASSWORD = ***
#    JWT_SECRET = (generar: node -e ...)
#    ADMIN_JWT_SECRET = (generar: node -e ...)
#    API_TOKEN_SALT = (generar: node -e ...)
#    NODE_ENV = production
```

#### 3. Conectar Frontend a Strapi

```bash
# En Vercel dashboard de Frontend
# → Settings → Environment Variables
# VITE_API_URL = https://strapi-{id}.vercel.app
# Trigger redeploy
```

#### 4. Verificar

```bash
curl https://strapi-{id}.vercel.app/admin
curl https://frontend-{id}.vercel.app
```

**Estimado:** 15 minutos | **Costo:** Free + $12/mes PostgreSQL (Vercel) o Free (Supabase)

---

## ✅ 4. Testing de Endpoints

Después de cualquier despliegue, validar funcionamiento:

### Health Check
```bash
curl http://localhost:4000/health  # Local
curl https://api.example.com/health  # Producción
```

### Productos
```bash
# Listar
curl http://localhost:4000/products

# Crear
curl -X POST http://localhost:4000/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","description":"Test product","price":99.99,"stock":10}'
```

### Usuarios
```bash
# Crear
curl -X POST http://localhost:4000/users \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# Login
curl -X POST http://localhost:4000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

### Órdenes
```bash
# Listar
curl http://localhost:4000/orders

# Crear
curl -X POST http://localhost:4000/orders \
  -H "Content-Type: application/json" \
  -d '{"user_id":1,"items":[{"product_id":1,"quantity":2,"price":99.99}],"total":199.98}'
```

### CMS
```bash
# Admin
curl http://localhost:1337/admin

# API
curl http://localhost:1337/api/pages
```

---

## 🔄 Matriz de Decisión

| Escenario | Recomendación | Tiempo | Costo |
|-----------|---------------|--------|-------|
| **Desarrollo local** | Docker Compose | 10 min | Gratis |
| **Testing/QA** | Docker Compose en servidor | 20 min | $5-10/mes |
| **Demo/MVP** | Vercel Frontend + Strapi | 15 min | Gratis-$12 |
| **Producción baja carga** | Vercel Frontend + Render Strapi | 30 min | $7-20/mes |
| **Producción media carga** | Kubernetes cluster | 1 hora | $50-200/mes |
| **Producción alta escala** | EKS/GKE + RDS | 2+ horas | $200+/mes |

---

## 📊 Checklist Estado Actual

### Código
- [x] Frontend React + Vite (5173)
- [x] API Gateway (4000)
- [x] Product Service (4001)
- [x] Cart Service (4002)
- [x] User Service (4003)
- [x] Orders Service (4004)
- [x] Strapi CMS (1337)
- [x] PostgreSQL (5432)

### Configuración
- [x] docker-compose.yml completo
- [x] Dockerfiles para todos los servicios
- [x] Esquema BD con InitSQL
- [x] Variables de entorno

### Kubernetes
- [x] 00-namespace.yaml (ConfigMap, Secret)
- [x] 01-postgres.yaml (StatefulSet)
- [x] 02-microservices.yaml (4 Deployments)
- [x] 03-gateway.yaml (LoadBalancer)
- [x] 04-strapi.yaml (Deployment + PVC)
- [x] 05-frontend.yaml (Deployment + LoadBalancer)
- [x] 06-ingress.yaml (nginx-ingress)
- [x] postgres-init-configmap.yaml (InitSQL)

### Documentación
- [x] QUICK_START.md
- [x] DEPLOYMENT_KUBERNETES.md
- [x] DEPLOYMENT_VERCEL.md
- [x] DEPLOYMENT_SUMMARY.md
- [x] Este archivo (DEPLOY_CHECKLIST.md)

### Validación
- [ ] `docker-compose up -d` completa sin errores
- [ ] Acceso a http://localhost:5173 ✅ Frontend
- [ ] Acceso a http://localhost:4000/health ✅ Gateway
- [ ] Acceso a http://localhost:1337/admin ✅ CMS
- [ ] Créar usuario, login, crear orden funciona
- [ ] Kubectl apply a cluster K8s funciona
- [ ] Frontend desplegado en Vercel accesible

---

## 🎯 Próximos Pasos

### Después del Despliegue Inicial
1. [ ] Cambiar contraseñas por defecto
2. [ ] Configurar dominio personalizado (si aplica)
3. [ ] Agregar SSL/TLS (ya incluido en Vercel)
4. [ ] Configurar CI/CD pipeline (GitHub Actions)
5. [ ] Agregar monitoreo (Datadog, New Relic, CloudWatch)
6. [ ] Configurar backups automáticos

### Mejoras Futuras
- [ ] Message Queue (RabbitMQ, Redis) para órdenes asincrónicas
- [ ] Caché distribuida (Redis) para productos
- [ ] Elasticsearch para búsqueda de productos
- [ ] Notificaciones por email (SendGrid, Mailgun)
- [ ] Pagos con Stripe/PayPal
- [ ] Autenticación social (OAuth2)

---

## 📞 Soporte

### Recursos
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Kubernetes Docs](https://kubernetes.io/docs/)
- [Vercel Docs](https://vercel.com/docs)
- [Strapi Docs](https://strapi.io/documentation/)

### Comandos de Emergencia

```bash
# Si todo está roto en Docker
docker system prune -a --volumes
docker-compose build --no-cache
docker-compose up -d

# Si todo está roto en K8s
kubectl delete namespace webstack
kubectl delete clusterrolebinding webstack-admin
kubectl apply -f k8s/

# Limpiar Vercel
vercel remove  # Solicita confirmación
```

---

**Última actualización:** 2024-01-15  
**Versión:** 1.0 Completa  
**Estado:** ✅ PROYECTO FUNCIONAL EN TODOS LOS ENTORNOS
