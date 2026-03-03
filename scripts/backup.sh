#!/bin/bash

# Script de Backup Automático para WebStack
# Respalda la base de datos y archivos de la aplicación

set -euo pipefail

# Configuración
BACKUP_DIR="/workspaces/Docker_IAW/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30
CONTAINER_NAME="webstack_app"

# Crear directorio si no existe
mkdir -p "$BACKUP_DIR"

echo "📦 Iniciando backup en $(date)"

# 1. Backup de Base de Datos SQLite
echo "  → Backupeando base de datos..."
docker exec -T "$CONTAINER_NAME" sqlite3 /data/tienda.db ".dump" > "$BACKUP_DIR/tienda_$TIMESTAMP.sql"
gzip "$BACKUP_DIR/tienda_$TIMESTAMP.sql"
echo "  ✅ Base de datos backupeada: tienda_$TIMESTAMP.sql.gz"

# 2. Backup de archivos de configuración y aplicación
echo "  → Comprimiendo archivos de aplicación..."
tar -czf "$BACKUP_DIR/app_$TIMESTAMP.tar.gz" \
  --exclude=node_modules \
  --exclude=.git \
  -C /workspaces/Docker_IAW app nginx

echo "  ✅ Archivos backupeados: app_$TIMESTAMP.tar.gz"

# 3. Limpiar backups viejos (mantener solo últimos 30 días)
echo "  → Limpiando backups antiguos (> $RETENTION_DAYS días)..."
find "$BACKUP_DIR" -type f -mtime +$RETENTION_DAYS -delete

# 4. Mostrar espacio utilizado
echo ""
echo "📊 Información de backups:"
du -sh "$BACKUP_DIR"
echo ""
echo "📄 Archivos en $BACKUP_DIR:"
ls -lh "$BACKUP_DIR" | tail -10

echo ""
echo "✅ Backup completado exitosamente"
echo "⏰ Siguiente ejecución: $(date --date='tomorrow 22:00')"
