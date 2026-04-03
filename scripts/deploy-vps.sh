#!/bin/bash

# ============================================
# Script de Deploy para Hostinger VPS
# POS PyMES - Sistema de Punto de Venta
# ============================================

set -e

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Funciones de logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuración
APP_NAME="pos-pymes"
BACKUP_DIR="/opt/backups/$APP_NAME"
DATA_DIR="/opt/$APP_NAME/data"
COMPOSE_FILE="docker-compose.prod.yml"

# ============================================
# 1. Verificar requisitos
# ============================================
log_info "Verificando requisitos del sistema..."

if ! command -v docker &> /dev/null; then
    log_error "Docker no está instalado"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose no está instalado"
    exit 1
fi

log_success "Requisitos verificados"

# ============================================
# 2. Crear directorios necesarios
# ============================================
log_info "Creando directorios necesarios..."

mkdir -p $DATA_DIR
mkdir -p $BACKUP_DIR
mkdir -p ./logs

log_success "Directorios creados"

# ============================================
# 3. Backup de datos existentes
# ============================================
if [ -f "$DATA_DIR/local.db" ]; then
    log_info "Haciendo backup de base de datos existente..."
    cp $DATA_DIR/local.db $BACKUP_DIR/local.db.$(date +%Y%m%d_%H%M%S)
    log_success "Backup completado"
fi

# ============================================
# 4. Verificar variables de entorno
# ============================================
log_info "Verificando variables de entorno..."

if [ ! -f .env ]; then
    log_warning "Archivo .env no encontrado"
    if [ -f .production.env ]; then
        log_info "Copiando .production.env a .env"
        cp .production.env .env
        log_warning "Por favor, edita .env con tus valores de producción"
        exit 1
    else
        log_error "No se encontró archivo de configuración"
        exit 1
    fi
fi

log_success "Variables de entorno verificadas"

# ============================================
# 5. Descartar cambios locales (opcional)
# ============================================
log_info "Obteniendo última versión del repositorio..."

git fetch origin
git reset --hard origin/main
# O si quieres usar una rama específica:
# git reset --hard origin/production

log_success "Código actualizado"

# ============================================
# 6. Construir imágenes Docker
# ============================================
log_info "Construyendo imágenes Docker..."
log_warning "Esto puede tomar varios minutos..."

docker-compose -f $COMPOSE_FILE build --no-cache

log_success "Imágenes construidas"

# ============================================
# 7. Detener contenedores anteriores
# ============================================
log_info "Deteniendo contenedores anteriores..."

docker-compose -f $COMPOSE_FILE down

log_success "Contenedores detenidos"

# ============================================
# 8. Iniciar contenedores
# ============================================
log_info "Iniciando contenedores..."

docker-compose -f $COMPOSE_FILE up -d

log_success "Contenedores iniciados"

# ============================================
# 9. Verificar estado de los contenedores
# ============================================
log_info "Verificando estado de los contenedores..."
sleep 5

docker-compose -f $COMPOSE_FILE ps

# ============================================
# 10. Verificar salud de los servicios
# ============================================
log_info "Verificando salud de los servicios..."

MAX_RETRIES=10
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s http://localhost:3001/health > /dev/null; then
        log_success "API está respondiendo correctamente"
        break
    fi

    RETRY_COUNT=$((RETRY_COUNT+1))
    log_info "Esperando a que la API esté lista... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 5
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    log_error "La API no está respondiendo. Revisa los logs:"
    docker-compose -f $COMPOSE_FILE logs api
    exit 1
fi

# ============================================
# 11. Mostrar información de acceso
# ============================================
log_success "============================================"
log_success "¡Deploy completado exitosamente!"
log_success "============================================"
echo ""
echo "Aplicación POS: http://localhost:3000"
echo "API: http://localhost:3001"
echo "Health Check: http://localhost:3001/health"
echo ""
echo "Logs en tiempo real:"
echo "  docker-compose -f $COMPOSE_FILE logs -f"
echo ""
echo "Ver estado:"
echo "  docker-compose -f $COMPOSE_FILE ps"
echo ""
echo "Backup de base de datos:"
echo "  $BACKUP_DIR/"
echo ""
log_success "============================================"

# ============================================
# 12. Configurar reinicio automático
# ============================================
log_info "Configurando reinicio automático..."

# Crear script de inicio automático
cat > /etc/systemd/system/pos-pymes.service << EOF
[Unit]
Description=POS PyMES Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/$APP_NAME
ExecStart=/usr/bin/docker-compose -f $COMPOSE_FILE up -d
ExecStop=/usr/bin/docker-compose -f $COMPOSE_FILE down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable pos-pymes.service

log_success "Reinicio automático configurado"

log_success "============================================"
log_success "¡Deploy finalizado!"
log_success "============================================"
