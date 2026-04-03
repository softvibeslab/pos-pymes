#!/bin/bash

# ============================================
# Script de Backup para Producción
# POS PyMES
# ============================================

set -e

# Configuración
APP_NAME="pos-pymes"
BACKUP_DIR="/opt/backups/$APP_NAME"
DATA_DIR="/opt/$APP_NAME/data"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="$APP_NAME-backup-$DATE"

# Crear directorio de backup si no existe
mkdir -p $BACKUP_DIR

echo "=========================================="
echo "Backup: POS PyMES"
echo "Fecha: $(date)"
echo "=========================================="

# 1. Backup de la base de datos
echo "Haciendo backup de base de datos..."
docker exec pos-pymes-api \
  sqlite3 /app/data/local.db \
  ".backup /app/data/backup.db"

cp $DATA_DIR/backup.db "$BACKUP_DIR/${BACKUP_NAME}.db"
rm $DATA_DIR/backup.db

echo "Base de datos respaldada en: $BACKUP_DIR/${BACKUP_NAME}.db"

# 2. Backup del archivo .env
echo "Haciendo backup de configuración..."
cp /opt/$APP_NAME/.env "$BACKUP_DIR/${BACKUP_NAME}.env"

echo "Configuración respaldada en: $BACKUP_DIR/${BACKUP_NAME}.env"

# 3. Crear archivo comprimido
echo "Comprimiendo backup..."
cd $BACKUP_DIR
tar -czf "${BACKUP_NAME}.tar.gz" \
  "${BACKUP_NAME}.db" \
  "${BACKUP_NAME}.env"

# Eliminar archivos individuales, mantener solo el comprimido
rm "${BACKUP_NAME}.db" "${BACKUP_NAME}.env"

echo "Backup comprimido en: $BACKUP_DIR/${BACKUP_NAME}.tar.gz"

# 4. Mantener solo los últimos 7 días de backups
echo "Limpiando backups antiguos (mantener últimos 7 días)..."
find $BACKUP_DIR -name "${APP_NAME}-backup-*.tar.gz" -mtime +7 -delete

# 5. Mostrar espacio utilizado
echo ""
echo "Espacio utilizado por backups:"
du -sh $BACKUP_DIR

echo "=========================================="
echo "¡Backup completado!"
echo "=========================================="
echo "Archivo: ${BACKUP_NAME}.tar.gz"
echo "Ubicación: $BACKUP_DIR"
echo ""
echo "Restaurar con:"
echo "  cd $BACKUP_DIR"
echo "  tar -xzf ${BACKUP_NAME}.tar.gz"
echo "  cp ${BACKUP_NAME}.db $DATA_DIR/local.db"
echo "=========================================="
