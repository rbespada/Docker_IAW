#!/bin/bash

# Script para Restaurar desde Backup
# Uso: ./restore.sh <archivo_backup.sql.gz>

if [ $# -eq 0 ]; then
  echo "❌ Uso: ./restore.sh <archivo_backup.sql.gz>"
  echo ""
  echo "Archivos disponibles:"
  ls -lh /workspaces/Docker_IAW/backups/*.sql.gz 2>/dev/null || echo "No hay backups SQL disponibles"
  exit 1
fi

BACKUP_FILE="$1"
CONTAINER_NAME="webstack_app"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ Archivo no encontrado: $BACKUP_FILE"
  exit 1
fi

echo "⚠️  Advertencia: Esta operación sobrescribirá la base de datos actual"
echo "Archivo: $BACKUP_FILE"
read -p "¿Continuar? (s/n): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
  echo "Operación cancelada"
  exit 0
fi

echo "🔄 Restaurando base de datos..."

# Descomprimir si es .gz
if [[ "$BACKUP_FILE" == *.gz ]]; then
  gunzip -c "$BACKUP_FILE" | docker exec -i "$CONTAINER_NAME" sqlite3 /data/tienda.db
else
  docker exec -i "$CONTAINER_NAME" sqlite3 /data/tienda.db < "$BACKUP_FILE"
fi

echo "✅ Base de datos restaurada exitosamente"
echo "🔄 Reiniciando aplicación..."

docker-compose restart app

echo "✅ Aplicación reiniciada"
echo "🌐 Accede a: http://localhost"
