# 🐧 Guía de Deploy en Hostinger VPS - POS PyMES

Esta guía te explica paso a paso cómo hacer deploy del sistema POS PyMES en tu VPS de Hostinger usando Docker.

## 📋 Índice

1. [Requisitos Previos](#requisitos-previos)
2. [Preparación del VPS](#preparación-del-vps)
3. [Instalación de Docker](#instalación-de-docker)
4. [Deploy de la Aplicación](#deploy-de-la-aplicación)
5. [Configuración del Dominio](#configuración-del-dominio)
6. [SSL con Let's Encrypt](#ssl-with-lets-encrypt)
7. [Mantenimiento y Monitoreo](#mantenimiento-y-monitoreo)
8. [Backup y Restore](#backup-y-restore)
9. [Solución de Problemas](#solución-de-problemas)

---

## Requisitos Previos

### VPS de Hostinger

Mínimo recomendado:
- **CPU:** 2 vCPU
- **RAM:** 4GB
- **Almacenamiento:** 40GB SSD
- **Sistema Operativo:** Ubuntu 22.04 LTS o 24.04 LTS

### Necesitarás:

- ✅ Acceso SSH al VPS
- ✅ Dominio configurado apuntando al VPS
- ✅ Cuenta de GitHub
- ✅ Conocimientos básicos de Linux

---

## Preparación del VPS

### 1. Conectar al VPS

```bash
# Desde tu terminal local
ssh root@tu-ip-del-vps

# O usando tu dominio
ssh root@tu-dominio.com
```

### 2. Actualizar el Sistema

```bash
# Actualizar paquetes
apt update && apt upgrade -y

# Instalar utilidades básicas
apt install -y git curl wget vim ufw fail2ban
```

### 3. Crear Usuario para la Aplicación

```bash
# Crear usuario
adduser pospymes

# Dar privilegios sudo
usermod -aG sudo pospymes

# Cambiar al usuario
su - pospymes
```

### 4. Configurar Firewall

```bash
# Permitir SSH
ufw allow 22/tcp

# Permitir HTTP y HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Permitir puertos de la aplicación (opcional)
ufw allow 3000/tcp
ufw allow 3001/tcp

# Activar firewall
ufw enable

# Ver estado
ufw status
```

---

## Instalación de Docker

### 1. Instalar Docker

```bash
# Descargar script de instalación
curl -fsSL https://get.docker.com -o get-docker.sh

# Ejecutar script
sudo sh get-docker.sh

# Verificar instalación
docker --version
# Docker version 24.0.7, build afdd53b

# Habilitar Docker al inicio
sudo systemctl enable docker
sudo systemctl start docker
```

### 2. Instalar Docker Compose

```bash
# Descargar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Dar permisos de ejecución
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalación
docker-compose --version
# docker-compose version 2.23.0
```

### 3. Configurar Usuario para Docker

```bash
# Agregar usuario al grupo docker
sudo usermod -aG docker $USER

# Recargar grupos
newgrp docker

# Verificar
docker ps
```

---

## Deploy de la Aplicación

### 1. Clonar el Repositorio

```bash
# Cambiar al directorio home
cd ~

# Clonar repositorio
git clone https://github.com/softvibeslab/pos-pymes.git

# Entrar en el directorio
cd pos-pymes

# Verificar rama (usar la rama de producción si existe)
git branch
```

### 2. Configurar Variables de Entorno

```bash
# Copiar archivo de entorno de ejemplo
cp .production.env .env

# Editar con tus valores
vim .env
```

**Configurar:**

```bash
# .env - Configuración de Producción
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
DATABASE_PATH=/app/data/local.db
LOG_LEVEL=info
CORS_ORIGIN=https://tu-dominio.com,https://www.tu-dominio.com
NEXT_PUBLIC_API_URL=https://tu-dominio.com/api
```

### 3. Dar Permisos a los Scripts

```bash
# Dar permisos de ejecución
chmod +x scripts/deploy-vps.sh
chmod +x scripts/backup.sh
```

### 4. Ejecutar Script de Deploy

```bash
# Ejecutar deploy
./scripts/deploy-vps.sh
```

El script hará:
- ✅ Verificar requisitos
- ✅ Crear directorios necesarios
- ✅ Hacer backup si existen datos
- ✅ Construir imágenes Docker
- ✅ Iniciar contenedores
- ✅ Verificar salud de los servicios
- ✅ Configurar reinicio automático

### 5. Verificar Deploy

```bash
# Ver contenedores en ejecución
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Verificar API
curl http://localhost:3001/health

# Verificar Frontend
curl http://localhost:3000
```

---

## Configuración del Dominio

### 1. Configurar DNS en Hostinger

1. **Entra al panel de Hostinger**
2. **Ve a Dominios → DNS**
3. **Agrega registros:**

```
Tipo: A
Nombre: @
Valor: TU-IP-DEL-VPS
TTL: 3600

Tipo: A
Nombre: www
Valor: TU-IP-DEL-VPS
TTL: 3600
```

4. **Espera propagación** (puede tomar 24-48 horas)

### 2. Verificar DNS

```bash
# Verificar que apunte a tu VPS
dig tu-dominio.com
dig www.tu-dominio.com

# O usar
nslookup tu-dominio.com
```

### 3. Configurar Nginx como Reverse Proxy (Opcional)

```bash
# Instalar Nginx
sudo apt install -y nginx

# Crear configuración
sudo vim /etc/nginx/sites-available/pos-pymes
```

**Contenido del archivo:**

```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    # Redirigir HTTP a HTTPS (después de configurar SSL)
    # return 301 https://$server_name$request_uri;

    # Frontend (POS)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3001/health;
        access_log off;
    }
}
```

**Activar sitio:**

```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/pos-pymes /etc/nginx/sites-enabled/

# Probar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

---

## SSL con Let's Encrypt

### 1. Instalar Certbot

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado SSL
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
```

### 2. Configurar Renovación Automática

```bash
# Verificar renovación automática
sudo certbot renew --dry-run

# El certbot ya configura un cron job automático
# Verificar con:
sudo systemctl status certbot.timer
```

### 3. Actualizar Nginx para SSL

Certbot actualizará automáticamente tu configuración de Nginx para usar HTTPS.

---

## Mantenimiento y Monitoreo

### Ver Logs en Tiempo Real

```bash
# Todos los contenedores
docker-compose -f docker-compose.prod.yml logs -f

# Solo API
docker-compose -f docker-compose.prod.yml logs -f api

# Solo Frontend
docker-compose -f docker-compose.prod.yml logs -f pos
```

### Ver Estado de los Contenedores

```bash
# Ver estado
docker-compose -f docker-compose.prod.yml ps

# Ver uso de recursos
docker stats
```

### Reiniciar Servicios

```bash
# Reiniciar todos
docker-compose -f docker-compose.prod.yml restart

# Reiniciar solo API
docker-compose -f docker-compose.prod.yml restart api

# Reiniciar solo Frontend
docker-compose -f docker-compose.prod.yml restart pos
```

### Actualizar la Aplicación

```bash
# Ir al directorio
cd ~/pos-pymes

# Obtener última versión
git pull origin main

# Ejecutar deploy de nuevo
./scripts/deploy-vps.sh
```

### Configurar Backup Automático

```bash
# Abrir crontab
crontab -e

# Agregar backup diario a las 3 AM
0 3 * * * /home/pospymes/pos-pymes/scripts/backup.sh

# Backup semanal cada domingo a las 4 AM
0 4 * * 0 /home/pospymes/pos-pymes/scripts/backup.sh
```

---

## Backup y Restore

### Hacer Backup Manual

```bash
# Ejecutar script de backup
./scripts/backup.sh
```

### Restore desde Backup

```bash
# Listar backups disponibles
ls -lh /opt/backups/pos-pymes/

# Detener contenedores
docker-compose -f docker-compose.prod.yml down

# Descomprimir backup
cd /opt/backups/pos-pymes
tar -xzf pos-pymes-backup-FECHA.tar.gz

# Copiar base de datos
cp pos-pymes-backup-FECHA.db /opt/pos-pymes/data/local.db

# Iniciar contenedores
cd ~/pos-pymes
docker-compose -f docker-compose.prod.yml up -d
```

---

## Solución de Problemas

### Problema: Contenedores no inician

```bash
# Ver logs de error
docker-compose -f docker-compose.prod.yml logs

# Verificar que los puertos no estén en uso
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :3001

# Detener procesos que usan los puertos
sudo kill -9 PID
```

### Problema: Error de permisos

```bash
# Dar permisos correctos
sudo chown -R pospymes:pospymes /opt/pos-pymes
sudo chmod -R 755 /opt/pos-pymes
```

### Problema: Base de datos corrupta

```bash
# Restaurar desde backup
./scripts/backup.sh --restore

# O recrear la base de datos
rm /opt/pos-pymes/data/local.db
docker-compose -f docker-compose.prod.yml restart api
```

### Problema: Sin espacio en disco

```bash
# Ver espacio usado
df -h

# Limpiar imágenes Docker no usadas
docker system prune -a

# Limpiar backups antiguos
find /opt/backups/pos-pymes/ -name "*.tar.gz" -mtime +30 -delete
```

### Verificar Salud del Sistema

```bash
# Uso de recursos
htop

# Espacio en disco
df -h

# Memoria
free -h

# Logs del sistema
sudo journalctl -f
```

---

## Seguridad Adicional

### 1. Configurar Fail2Ban

```bash
# Instalar Fail2Ban
sudo apt install -y fail2ban

# Configurar
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Editar configuración
sudo vim /etc/fail2ban/jail.local
```

### 2. Deshabilitar Login Root

```bash
# Editar configuración SSH
sudo vim /etc/ssh/sshd_config

# Cambiar
PermitRootLogin no

# Reiniciar SSH
sudo systemctl restart sshd
```

### 3. Configurar Autenticación por Llaves

```bash
# En tu máquina local
ssh-keygen -t rsa -b 4096

# Copiar llave pública al VPS
ssh-copy-id pospymes@tu-dominio.com
```

---

## Monitoreo

### Instalar Netdata (Opcional)

```bash
# Instalar Netdata para monitoreo
bash <(curl -Ss https://my-netdata.io/kickstart.sh)

# Acceder al dashboard
https://tu-dominio.com:19999
```

### Verificar Performance

```bash
# Uso de CPU
top

# Uso de memoria
free -h

# Uso de disco
du -sh /opt/pos-pymes

# Conexiones activas
sudo netstat -an | grep :3000
sudo netstat -an | grep :3001
```

---

## Resumen Rápido de Comandos

```bash
# Deploy inicial
./scripts/deploy-vps.sh

# Ver estado
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Reiniciar
docker-compose -f docker-compose.prod.yml restart

# Actualizar
git pull && ./scripts/deploy-vps.sh

# Backup
./scripts/backup.sh

# Verificar salud
curl http://localhost:3001/health
curl http://localhost:3000
```

---

## URLs Importantes

Después del deploy:

- **Aplicación POS:** https://tu-dominio.com
- **API:** https://tu-dominio.com/api
- **Health Check:** https://tu-dominio.com/api/health
- **Netdata (si instalaste):** https://tu-dominio.com:19999

---

## Soporte

Si tienes problemas:

1. Revisa los logs: `docker-compose logs`
2. Verifica la documentación: `/docs/deployment/`
3. Abre un issue en GitHub
4. Revisa la configuración de `.env`

---

## Costos Estimados

### Hostinger VPS

- **VPS KVM 2:** ~$5-8/mes (2GB RAM, 1CPU)
- **VPS KVM 4:** ~$10-15/mes (4GB RAM, 2CPU) - Recomendado
- **Dominio:** ~$10-15/año

### Total estimado: ~$15-20/mes

---

**¡Listo para hacer deploy en tu VPS de Hostinger!** 🚀
