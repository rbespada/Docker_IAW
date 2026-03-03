#!/bin/bash

# Script de Deploy
# Automatiza el despliegue completo del proyecto

set -euo pipefail

echo "🚀 WebStack Deploy Script"
echo "========================="

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Verificar requisitos
echo -e "\n${YELLOW}📋 Verificando requisitos...${NC}"

commands=("docker" "docker-compose" "git")
for cmd in "${commands[@]}"; do
  if ! command -v "$cmd" &> /dev/null; then
    echo -e "${RED}❌ $cmd no está instalado${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ $cmd${NC}"
done

# 2. Clonar/actualizar repositorio (si es necesario)
echo -e "\n${YELLOW}📥 Preparando repositorio...${NC}"
if [ ! -d ".git" ]; then
  echo "Inicializando repositorio..."
  git init
fi

# 3. Crear directorios necesarios
echo -e "\n${YELLOW}📁 Creando directorios...${NC}"
mkdir -p data backups scripts logs
chmod +x scripts/*.sh

# 4. Construir imágenes Docker
echo -e "\n${YELLOW}🔨 Construyendo imágenes Docker...${NC}"
docker-compose build --no-cache

# 5. Iniciar servicios
echo -e "\n${YELLOW}▶️  Iniciando servicios...${NC}"
docker-compose up -d

# 6. Esperar a que la aplicación esté lista
echo -e "\n${YELLOW}⏳ Esperando a que los servicios estén listos...${NC}"
sleep 5

# 7. Verificar salud de servicios
echo -e "\n${YELLOW}🏥 Verificando estado de servicios...${NC}"
if docker-compose ps | grep -q "Up"; then
  echo -e "${GREEN}✓ Servicios corriendo${NC}"
else
  echo -e "${RED}❌ Error al iniciar servicios${NC}"
  docker-compose logs
  exit 1
fi

# 8. Health checks
echo -e "\n${YELLOW}🔍 Ejecutando health checks...${NC}"

# Check Nginx
if curl -f http://localhost/health &>/dev/null; then
  echo -e "${GREEN}✓ Nginx está operacional${NC}"
else
  echo -e "${RED}❌ Nginx no responde${NC}"
fi

# Check App
if docker exec webstack_app node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error()})" 2>/dev/null; then
  echo -e "${GREEN}✓ Aplicación Node.js está operacional${NC}"
else
  echo -e "${RED}❌ Aplicación no responde${NC}"
fi

# 9. Información de acceso
echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}✅ Deploy completado exitosamente${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "📱 Acceder a la aplicación:"
echo "   🌐 http://localhost/"
echo "   📱 Usar navegador en: http://localhost"
echo ""
echo "📋 Comandos útiles:"
echo "   Ver logs:      docker-compose logs -f"
echo "   Parar:         docker-compose stop"
echo "   Reiniciar:     docker-compose restart"
echo "   Backup:        ./scripts/backup.sh"
echo "   Restaurar:     ./scripts/restore.sh backup_file.sql.gz"
echo ""
echo "⏸️  Para detener los servicios:"
echo "   docker-compose down"
echo ""
echo "🧹 Para limpiar todo (incluyendo datos):"
echo "   docker-compose down -v"
echo ""
