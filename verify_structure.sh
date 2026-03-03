#!/bin/bash

# Script de Verificación - Proyecto WebStack Microservicios
# Este script valida que todos los componentes están implementados correctamente

echo "=========================================="
echo "  Verificación WebStack Microservicios"
echo "=========================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar archivo
check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} $1"
    return 0
  else
    echo -e "${RED}✗${NC} $1 NO ENCONTRADO"
    return 1
  fi
}

# Función para verificar directorio
check_dir() {
  if [ -d "$1" ]; then
    echo -e "${GREEN}✓${NC} $1/"
    return 0
  else
    echo -e "${RED}✗${NC} $1/ NO ENCONTRADO"
    return 1
  fi
}

echo "1. Verificando directorios principales..."
echo "===================="
check_dir "services/product" || exit 1
check_dir "services/cart" || exit 1
check_dir "services/user" || exit 1
check_dir "services/gateway" || exit 1
check_dir "frontend" || exit 1
check_dir "db" || exit 1
check_dir "doc" || exit 1
echo ""

echo "2. Verificando archivos de configuración..."
echo "=========================================="
check_file "docker-compose.yml" || exit 1
check_file "README.md" || exit 1
check_file "GUIA_DESPLIEGUE.md" || exit 1
check_file "INSTRUCCIONES_COMMIT.md" || exit 1
check_file "ESTADO_PROYECTO.md" || exit 1
echo ""

echo "3. Verificando microservicios..."
echo "=============================="
for service in product cart user gateway; do
  echo -e "\n${YELLOW}$service Service:${NC}"
  check_file "services/$service/package.json"
  check_file "services/$service/index.js"
  check_file "services/$service/Dockerfile"
  check_file "services/$service/.gitignore"
done
echo ""

echo "4. Verificando base de datos..."
echo "=============================="
check_file "db/init.sql"
check_file "services/.env.example"
echo ""

echo "5. Verificando Frontend..."
echo "========================="
check_file "frontend/package.json"
check_file "frontend/index.html"
check_file "frontend/vite.config.js"
check_file "frontend/Dockerfile"
check_file "frontend/.gitignore"
check_dir "frontend/src"
check_file "frontend/src/main.jsx"
check_file "frontend/src/App.jsx"
check_file "frontend/src/App.css"
check_file "frontend/src/api.js"
echo ""

echo "6. Verificando documentación..."
echo "=============================="
check_file "doc/MICROSERVICIOS.md"
check_file "DIAGRAMA_ARQUITECTURA.md"
check_file "RESUMEN_EJECUTIVO_FASE2.md"
echo ""

echo "7. Verificando contenido de archivos críticos..."
echo "==============================================="

echo -e "\n${YELLOW}Checking docker-compose.yml:${NC}"
if grep -q "postgres:15-alpine" docker-compose.yml; then
  echo -e "${GREEN}✓${NC} PostgreSQL service defined"
else
  echo -e "${RED}✗${NC} PostgreSQL service NOT found"
fi

if grep -q "product" docker-compose.yml && grep -q "cart" docker-compose.yml && grep -q "user" docker-compose.yml; then
  echo -e "${GREEN}✓${NC} All microservices defined (product, cart, user)"
else
  echo -e "${RED}✗${NC} Missing microservices"
fi

if grep -q "gateway" docker-compose.yml; then
  echo -e "${GREEN}✓${NC} Gateway service defined"
else
  echo -e "${RED}✗${NC} Gateway service NOT found"
fi

if grep -q "frontend" docker-compose.yml; then
  echo -e "${GREEN}✓${NC} Frontend service defined"
else
  echo -e "${RED}✗${NC} Frontend service NOT found"
fi

echo -e "\n${YELLOW}Checking Product Service:${NC}"
if grep -q "Database" services/product/index.js; then
  echo -e "${GREEN}✓${NC} Product service has database integration"
else
  echo -e "${RED}✗${NC} Product service missing database code"
fi

echo -e "\n${YELLOW}Checking React App:${NC}"
if grep -q "useState" frontend/src/App.jsx; then
  echo -e "${GREEN}✓${NC} React useState found"
else
  echo -e "${RED}✗${NC} React useState NOT found"
fi

if grep -q "useEffect" frontend/src/App.jsx; then
  echo -e "${GREEN}✓${NC} React useEffect found"
else
  echo -e "${RED}✗${NC} React useEffect NOT found"
fi

if grep -q "axios" frontend/src/api.js || grep -q "Axios" frontend/src/api.js; then
  echo -e "${GREEN}✓${NC} Axios client found"
else
  echo -e "${RED}✗${NC} Axios client NOT found"
fi

echo -e "\n${YELLOW}Checking Database Schema:${NC}"
if grep -q "CREATE TABLE products" db/init.sql; then
  echo -e "${GREEN}✓${NC} Products table schema found"
else
  echo -e "${RED}✗${NC} Products table schema NOT found"
fi

if grep -q "CREATE TABLE cart_items" db/init.sql; then
  echo -e "${GREEN}✓${NC} Cart items table schema found"
else
  echo -e "${RED}✗${NC} Cart items table schema NOT found"
fi

if grep -q "CREATE TABLE users" db/init.sql; then
  echo -e "${GREEN}✓${NC} Users table schema found"
else
  echo -e "${RED}✗${NC} Users table schema NOT found"
fi

echo ""

echo "8. Conteo de líneas de código..."
echo "==============================="
echo -n "Documentación: "
wc -l doc/MICROSERVICIOS.md GUIA_DESPLIEGUE.md DIAGRAMA_ARQUITECTURA.md 2>/dev/null | tail -1 | awk '{print $1 " lines"}'

echo -n "Servicios Node.js: "
wc -l services/*/index.js 2>/dev/null | tail -1 | awk '{print $1 " lines"}'

echo -n "Frontend React: "
wc -l frontend/src/*.jsx 2>/dev/null | tail -1 | awk '{print $1 " lines"}'

echo -n "SQL Schema: "
wc -l db/init.sql 2>/dev/null | tail -1 | awk '{print $1 " lines"}'

echo ""

echo "9. Conteo de archivos..."
echo "======================="
echo "Microservicios Node.js: $(find services -name 'index.js' | wc -l)"
echo "Dockerfiles: $(find . -name 'Dockerfile' | wc -l)"
echo ".gitignore: $(find . -name '.gitignore' | wc -l)"

echo ""

echo "=========================================="
echo "  Verificación completada"
echo "=========================================="
echo ""
echo -e "${GREEN}Si todos los checks pasaron, puedes:${NC}"
echo "1. Hacer commit: git add . && git commit -m '...'"
echo "2. Hacer push: git push origin main"
echo "3. Desplegar: docker-compose up -d"
echo ""
echo -e "${YELLOW}Para información completa, ver:${NC}"
echo "- GUIA_DESPLIEGUE.md (instrucciones de despliegue)"
echo "- doc/MICROSERVICIOS.md (documentación técnica)"
echo "- DIAGRAMA_ARQUITECTURA.md (visualizaciones)"
