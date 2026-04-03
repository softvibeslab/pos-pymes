# 🚀 POS PyMES - Guía de Deploy en Producción

Esta versión está preparada para hacer deploy en producción en tu VPS de Hostinger o en Netlify.

## 📋 Opciones de Deploy

### 1. VPS de Hostinger (Recomendado - Full Stack)

Deploy completo del sistema (API + Frontend) en tu propio VPS.

**📖 Ver guía completa:** [docs/deployment/VPS.md](docs/deployment/VPS.md)

**Requisitos:**
- VPS con Ubuntu 22.04+
- 2 vCPU, 4GB RAM mínimo
- Dominio configurado
- Docker instalado

**Comandos rápidos:**

```bash
# 1. Clonar repositorio
git clone https://github.com/softvibeslab/pos-pymes.git
cd pos-pymes

# 2. Configurar variables de entorno
cp .production.env .env
vim .env  # Edita con tus valores

# 3. Ejecutar deploy
./scripts/deploy-vps.sh

# ¡Listo! Tu sistema estará en https://tu-dominio.com
```

**Incluye:**
- ✅ API completa con Fastify
- ✅ Frontend POS con Next.js
- ✅ Base de datos SQLite
- ✅ Configuración SSL con Let's Encrypt
- ✅ Backup automático
- ✅ Reinicio automático
- ✅ Monitoreo de salud

---

### 2. Netlify (Frontend Only - PWA)

Deploy solo del frontend en Netlify.

**📖 Ver guía completa:** [docs/deployment/NETLIFY.md](docs/deployment/NETLIFY.md)

**Requisitos:**
- Cuenta en Netlify (gratis)
- API deployada en otro servidor
- Dominio (opcional)

**Pasos rápidos:**

1. **Conecta GitHub con Netlify**
2. **Selecciona el repositorio `pos-pymes`**
3. **Configura el build:**
   ```
   Build command: pnpm --filter @pos-pymes/shared build && pnpm --filter @pos-pymes/pos build
   Publish directory: apps/pos/.next
   ```
4. **Agrega variables de entorno:**
   ```
   NEXT_PUBLIC_API_URL=https://tu-api-url.com/api
   ```
5. **Deploy!**

**Incluye:**
- ✅ Frontend POS optimizado
- ✅ PWA con service worker
- ✅ CDN global de Netlify
- ✅ SSL gratuito
- ✅ Deploy automático desde GitHub
- ✅ Preview deployments

---

## 🗂️ Estructura de Archivos de Deploy

```
pos-pymes/
├── .production.env              # Variables de entorno para producción
├── docker-compose.prod.yml      # Docker Compose optimizado para VPS
├── netlify.toml                 # Configuración de Netlify
├── scripts/
│   ├── deploy-vps.sh           # Script de deploy para VPS
│   └── backup.sh               # Script de backup automático
└── docs/deployment/
    ├── VPS.md                  # Guía completa para VPS
    └── NETLIFY.md              # Guía completa para Netlify
```

---

## ⚙️ Configuración Previa al Deploy

### 1. VPS de Hostinger

Edita `.production.env`:

```bash
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
DATABASE_PATH=/app/data/local.db
CORS_ORIGIN=https://tu-dominio.com
NEXT_PUBLIC_API_URL=https://tu-dominio.com/api
```

### 2. Netlify

Configura en el dashboard de Netlify:

```bash
NEXT_PUBLIC_API_URL=https://tu-api-url.com/api
```

---

## 🔒 Seguridad

### VPS

- ✅ Firewall configurado (UFW)
- ✅ SSL con Let's Encrypt
- ✅ Docker aislado
- ✅ Usuario dedicado
- ✅ Fail2Ban para protección contra brute force

### Netlify

- ✅ HTTPS automático
- ✅ Headers de seguridad
- ✅ Protección DDoS
- ✅ Edge caching

---

## 💰 Costos

### Opción 1: VPS Completo (Hostinger)

- **VPS:** $10-15/mes
- **Dominio:** $10-15/año
- **Total:** ~$15-20/mes

### Opción 2: Frontend Netlify + API en VPS

- **VPS (solo API):** $5-8/mes
- **Netlify:** Gratis
- **Dominio:** $10-15/año
- **Total:** ~$8-12/mes

---

## 🔄 Actualizaciones

### VPS

```bash
cd ~/pos-pymes
git pull origin production
./scripts/deploy-vps.sh
```

### Netlify

Automático - Solo haz push a GitHub:
```bash
git add .
git commit -m "Mi cambio"
git push origin production
```

---

## 📊 Monitoreo

### VPS

```bash
# Ver estado
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Health check
curl https://tu-dominio.com/api/health
```

### Netlify

Ver en el dashboard:
- Deploys
- Functions
- Analytics

---

## 🛠️ Mantenimiento

### Backup Automático (VPS)

```bash
# El script de deploy configura un cron job automático
# Backup diario a las 3 AM

# Manualmente:
./scripts/backup.sh
```

### Logs

**VPS:**
```bash
# Últimas 100 líneas
docker-compose logs --tail=100

# En tiempo real
docker-compose logs -f
```

**Netlify:**
Ver en dashboard → Deploys → View logs

---

## 🆘 Solución de Problemas

### VPS

**Problema:** Contenedores no inician
```bash
# Ver logs
docker-compose logs

# Verificar puertos
sudo netstat -tulpn | grep :3000

# Reiniciar
docker-compose restart
```

**Problema:** Sin espacio
```bash
# Limpiar Docker
docker system prune -a

# Ver espacio
df -h
```

### Netlify

**Problema:** Build falla
- Verifica que el build funcione localmente
- Revisa los logs de Netlify
- Verifica variables de entorno

**Problema:** API no conecta
- Verifica que la API esté funcionando
- Verifica CORS
- Verifica la variable NEXT_PUBLIC_API_URL

---

## 📞 Soporte

- 📖 [Documentación completa](docs/deployment/)
- 🐛 [Issues en GitHub](https://github.com/softvibeslab/pos-pymes/issues)
- 📧 Email: soporte@tu-dominio.com

---

## ✅ Checklist Pre-Deploy

### VPS
- [ ] VPS configurado con Ubuntu 22.04+
- [ ] Docker y Docker Compose instalados
- [ ] Dominio configurado apuntando al VPS
- [ ] Archivo `.env` configurado
- [ ] Puertos 80 y 443 abiertos
- [ ] Firewall configurado

### Netlify
- [ ] Cuenta en Netlify creada
- [ ] GitHub conectado
- [ ] Variables de entorno configuradas
- [ ] API funcionando en servidor separado

---

**¿Listo para hacer deploy? Elige tu opción y sigue la guía correspondiente.** 🚀
