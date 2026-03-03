# Guía de Despliegue en Kubernetes

## Requisitos Previos

- **kubectl** instalado y configurado
- **Cluster de Kubernetes** activo (EKS, GKE, AKS, minikube, etc.)
- **Docker** para construir imágenes locales
- **Acesso al registro Docker** (Docker Hub, ECR, GCR, etc.)

## Estructura de Manifiestos Kubernetes

```
k8s/
├── 00-namespace.yaml          # Namespace, ConfigMap, Secrets
├── 01-postgres.yaml           # StatefulSet de PostgreSQL + Service
├── 02-microservices.yaml      # Deployments: Product, Cart, User, Orders + Services
├── 03-gateway.yaml            # Deployment API Gateway + LoadBalancer Service
├── 04-strapi.yaml             # Deployment Strapi CMS + PersistentVolumeClaim + LoadBalancer
├── 05-frontend.yaml           # Deployment React Frontend + LoadBalancer Service
└── 06-ingress.yaml            # Ingress Controller para unified routing
```

## Pasos de Despliegue

### 1. Crear Imágenes Docker

Debe construir las imágenes Docker para cada servicio. Si usa un registro privado (como Docker Hub):

```bash
# Desde la raíz del proyecto

# Build de cada servicio
docker build -t webstack/product-service:latest services/product -f services/product/Dockerfile
docker build -t webstack/cart-service:latest services/cart -f services/cart/Dockerfile
docker build -t webstack/user-service:latest services/user -f services/user/Dockerfile
docker build -t webstack/orders-service:latest services/orders -f services/orders/Dockerfile
docker build -t webstack/api-gateway:latest services/gateway -f services/gateway/Dockerfile
docker build -t webstack/strapi:latest services/cms -f services/cms/Dockerfile
docker build -t webstack/frontend:latest frontend -f frontend/Dockerfile

# Push a registro (reemplazar 'webstack' con su usuario/organización)
docker push webstack/product-service:latest
docker push webstack/cart-service:latest
docker push webstack/user-service:latest
docker push webstack/orders-service:latest
docker push webstack/api-gateway:latest
docker push webstack/strapi:latest
docker push webstack/frontend:latest
```

**Nota:** Si usa un cluster local (minikube, kind), pude saltarse el push:
```bash
# minikube
eval $(minikube docker-env)
docker build -t webstack/product-service:latest ...

# kind
kind load docker-image webstack/product-service:latest
```

### 2. Desplegar en Kubernetes

```bash
# Aplicar todos los manifiestos en orden
kubectl apply -f k8s/00-namespace.yaml
kubectl apply -f k8s/01-postgres.yaml

# Esperar a que PostgreSQL esté listo
kubectl wait --for=condition=ready pod -l app=postgres -n webstack --timeout=300s

# Aplicar los microservicios
kubectl apply -f k8s/02-microservices.yaml
kubectl apply -f k8s/03-gateway.yaml
kubectl apply -f k8s/04-strapi.yaml
kubectl apply -f k8s/05-frontend.yaml

# Aplicar Ingress (requiere nginx-ingress-controller instalado)
kubectl apply -f k8s/06-ingress.yaml
```

### 3. Verificar Despliegue

```bash
# Ver pods
kubectl get pods -n webstack

# Ver servicios
kubectl get svc -n webstack

# Logs de un servicio específico
kubectl logs -f deployment/api-gateway -n webstack
kubectl logs -f deployment/strapi -n webstack

# Describir un pod para verificar errores
kubectl describe pod <pod-name> -n webstack

# Verificar salud
kubectl port-forward svc/api-gateway 4000:4000 -n webstack
curl http://localhost:4000/health
```

## Acceso a Servicios

### Via LoadBalancer (sin Ingress)

```bash
# Obtener IPs externas
kubectl get svc -n webstack

# Frontend: http://<FRONTEND-EXTERNAL-IP>:5173
# API Gateway: http://<GATEWAY-EXTERNAL-IP>:4000
# Strapi CMS: http://<STRAPI-EXTERNAL-IP>:1337
```

### Via Ingress (recomendado)

```bash
# Si Ingress está configurado
kubectl get ingress -n webstack

# Agregar a /etc/hosts (Linux/Mac)
echo "127.0.0.1 webstack.local" >> /etc/hosts

# Accedir via
# Frontend: http://webstack.local/
# API: http://webstack.local/products, /cart, /orders, etc.
# CMS: http://webstack.local/cms/admin
# Strapi Admin: http://webstack.local/admin
```

## Variables de Entorno Kubernetes

Las variables se definen en:

- **ConfigMap** (`webstack-config`): NODE_ENV, LOG_LEVEL
- **Secret** (`webstack-secrets`): Base de datos, JWT, salts

Para actualizar valores:

```bash
kubectl edit configmap webstack-config -n webstack
kubectl edit secret webstack-secrets -n webstack

# O reemplazar el Secret
kubectl delete secret webstack-secrets -n webstack
# Editar 00-namespace.yaml y aplicar
kubectl apply -f k8s/00-namespace.yaml
```

## Escalado y Recursos

### Cambiar número de réplicas

```bash
# Escalar manualmente
kubectl scale deployment product-service --replicas=3 -n webstack
kubectl scale deployment api-gateway --replicas=3 -n webstack

# O editar el Deployment
kubectl edit deployment api-gateway -n webstack
```

### Configurar Horizontal Pod Autoscaler (HPA)

```bash
# Crear HPA para API Gateway
kubectl autoscale deployment api-gateway --min=2 --max=10 --cpu-percent=70 -n webstack

# Ver HPA
kubectl get hpa -n webstack
```

## Persistencia de Datos

### PostgreSQL
- Usa **StatefulSet** con **PersistentVolumeClaim**
- Almacenamiento: 10Gi (configurable en `01-postgres.yaml`)
- Directorio: `/var/lib/postgresql/data`

### Strapi
- Usa **PersistentVolumeClaim** de 5Gi
- Directorio: `/srv/app`
- Contiene configuraciones, uploads, plugins

Para hacer backup:

```bash
# Backup PostgreSQL
kubectl exec -it postgres-0 -n webstack -- pg_dump -U postgres webstack > backup.sql

# Restore
kubectl exec -it postgres-0 -n webstack -- psql -U postgres webstack < backup.sql

# Backup Strapi data
kubectl cp webstack/strapi-pod:/srv/app ./strapi-backup -c strapi
```

## Troubleshooting

### Los pods no inician

```bash
# Ver logs detallados
kubectl logs <pod-name> -n webstack
kubectl describe pod <pod-name> -n webstack
kubectl get events -n webstack
```

### Conexión a base de datos fallida

```bash
# Verificar que PostgreSQL esté listo
kubectl get pod postgres-0 -n webstack
kubectl logs postgres-0 -n webstack

# Verificar variables de entorno
kubectl exec -it <pod-name> -n webstack -- env | grep DATABASE
```

### Ingress no funciona

```bash
# Verificar que nginx-ingress-controller esté instalado
kubectl get deployment -n ingress-nginx

# Instalar si no existe
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.0/deploy/static/provider/cloud/deploy.yaml
```

### CMS no accesible desde el frontend

```bash
# Verificar que Strapi esté ejecutándose
kubectl get pod -l app=strapi -n webstack

# Ver logs de Strapi
kubectl logs -f deployment/strapi -n webstack

# Ejecutar curl desde el pod del frontend
kubectl exec -it <frontend-pod> -n webstack -- curl http://strapi:1337/admin
```

## Despliegue a Proveedores Cloud

### EKS (AWS)
```bash
aws eks create-cluster --name webstack --region us-east-1 --kubernetes-network-config ipv4Cidr=10.0.0.0/16
aws eks update-kubeconfig --region us-east-1 --name webstack
kubectl apply -f k8s/
```

### GKE (Google Cloud)
```bash
gcloud container clusters create webstack --zone us-central1-a
gcloud container clusters get-credentials webstack --zone us-central1-a
kubectl apply -f k8s/
```

### AKS (Azure)
```bash
az aks create --resource-group myResourceGroup --name webstack --node-count 3
az aks get-credentials --resource-group myResourceGroup --name webstack
kubectl apply -f k8s/
```

## Limpieza

Para eliminar todo el despliegue:

```bash
# Eliminar namespace (borra todos los recursos)
kubectl delete namespace webstack

# O eliminar archivos específicos
kubectl delete -f k8s/06-ingress.yaml
kubectl delete -f k8s/05-frontend.yaml
kubectl delete -f k8s/04-strapi.yaml
kubectl delete -f k8s/03-gateway.yaml
kubectl delete -f k8s/02-microservices.yaml
kubectl delete -f k8s/01-postgres.yaml
kubectl delete -f k8s/00-namespace.yaml
```

## Referencias

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [Nginx Ingress Controller](https://kubernetes.github.io/ingress-nginx/)
- [PostgreSQL Kubernetes Deployment](https://kubernetes.io/docs/tasks/manage-data-consistency/stateful-application/mysql-wordpress-persistent-volume/)
