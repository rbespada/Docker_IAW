#!/bin/bash

# Script para configurar cron job de backup automático

SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/backup.sh"
CRON_JOB="0 22 * * * $SCRIPT_PATH >> /var/log/webstack_backup.log 2>&1"

echo "📅 Configurando backup automático..."
echo "   Script: $SCRIPT_PATH"
echo "   Hora: 22:00 UTC diariamente"

# Añadir cron job
(crontab -l 2>/dev/null | grep -v "backup.sh"; echo "$CRON_JOB") | crontab -

echo "✅ Cron job creado"
echo ""
echo "Ver cron jobs:"
echo "   crontab -l"
echo ""
echo "Ver logs de backup:"
echo "   tail -f /var/log/webstack_backup.log"
