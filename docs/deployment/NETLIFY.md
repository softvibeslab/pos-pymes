# 🚀 Guía de Deploy en Netlify - POS PyMES

Esta guía te explica cómo hacer deploy del frontend de POS PyMES en Netlify.

## 📋 Índice

1. [Preparación](#preparación)
2. [Método 1: Deploy desde GitHub](#método-1-deploy-desde-github)
3. [Método 2: Deploy con Netlify CLI](#método-2-deploy-con-netlify-cli)
4. [Configuración del Dominio](#configuración-del-dominio)
5. [Variables de Entorno](#variables-de-entorno)
6. [Actualizaciones Automáticas](#actualizaciones-automáticas)
7. [Solución de Problemas](#solución-de-problemas)

---

## Preparación

### Requisitos Previos

1. **Cuenta en Netlify**
   - Regístrate en https://www.netlify.com
   - El plan gratuito es suficiente

2. **Código en GitHub**
   - Asegúrate de que el código esté en GitHub
   - Repositorio: https://github.com/softvibeslab/pos-pymes

3. **API Deployada**
   - La API debe estar funcionando en algún servidor
   - Necesitarás la URL pública de la API

### Estructura del Proyecto

```
pos-pymes/
├── apps/pos/          # Este es el directorio que vamos a deployar
├── netlify.toml       # Configuración de Netlify
└── package.json       # Dependencias
```

---

## Método 1: Deploy desde GitHub (Recomendado)

### Paso 1: Conectar GitHub con Netlify

1. **Inicia sesión en Netlify**
   - Ve a https://app.netlify.com
   - Haz clic en "Sign up" o "Log in"

2. **Conecta tu cuenta de GitHub**
   ```
   Netlify Dashboard → New site from Git → GitHub
   ```

3. **Autoriza Netlify**
   - Haz clic en "Install Netlify on GitHub"
   - Selecciona el repositorio `pos-pymes` o todos los repositorios
   - Configura los permisos necesarios

### Paso 2: Configurar el Site en Netlify

1. **Selecciona el repositorio**
   ```
   Repository: softvibeslab/pos-pymes
   Branch: main o production
   ```

2. **Configura el Build**
   ```
   Build command:
   pnpm --filter @pos-pymes/shared build && pnpm --filter @pos-pymes/pos build

   Publish directory:
   apps/pos/.next
   ```

3. **Configura las variables de entorno**
   ```
   NEXT_PUBLIC_API_URL = https://tu-api-url.com/api
   ```

### Paso 3: Deploy Inicial

1. **Haz clic en "Deploy site"**
2. Espera a que termine el build (3-5 minutos)
3. Netlify te asignará una URL: `https://random-name.netlify.app`

### Paso 4: Verifica el Deploy

```bash
# Verifica que el sitio esté funcionando
curl https://tu-sitio.netlify.app

# Deberías ver la aplicación POS cargando
```

---

## Método 2: Deploy con Netlify CLI

### Instalar Netlify CLI

```bash
# Instalar globalmente
npm install -g netlify-cli

# O con pnpm
pnpm add -g netlify-cli
```

### Autenticarse

```bash
# Login en Netlify
netlify login

# Te redirigirá al navegador para autorizar
```

### Inicializar Netlify

```bash
# Desde la raíz del proyecto
cd /ruta/a/pos-pymes

# Inicializar Netlify
netlify init
```

### Responde a las preguntas:

```
? What would you like to do?
  → Create & configure a new site

? Team:
  → Tu equipo o cuenta personal

? Site name (optional):
  → pos-pymes-tu-nombre

? Site command:
  → pnpm --filter @pos-pymes/shared build && pnpm --filter @pos-pymes/pos build

? Directory to deploy:
  → apps/pos
```

### Deploy Manual

```bash
# Deploy a producción
netlify deploy --prod

# Deploy a preview
netlify deploy
```

---

## Configuración del Dominio

### Opción 1: Subdominio de Netlify (Gratis)

```
https://pos-pymes-tu-nombre.netlify.app
```

### Opción 2: Dominio Personalizado

1. **Compra un dominio** (ej. en Namecheap, GoDaddy, etc.)

2. **Agrega el dominio en Netlify**
   ```
   Domain settings → Add custom domain
   → Ingresa tu-dominio.com
   ```

3. **Configura DNS**

   **Si compraste el dominio en otro registrador:**
   ```
   Tipo: CNAME
   Nombre: @ (o tu subdominio)
   Valor: tu-sitio.netlify.app
   ```

4. **Verifica el dominio**
   - Netlify te proporcionará un certificado SSL automáticamente
   - Espera la propagación DNS (puede tomar 24-48 horas)

### Opción 3: Subdominio

```
pos.tu-dominio.com
```

Configura como un dominio personalizado pero con el subdominio.

---

## Variables de Entorno

### Configurar en Netlify Dashboard

```
Site settings → Environment variables → Add variable
```

### Variables Necesarias

```bash
# URL de la API en producción
NEXT_PUBLIC_API_URL=https://tu-api-url.com/api
```

### Variables Opcionales

```bash
# Para análisis
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Para soporte
NEXT_PUBLIC_SUPPORT_EMAIL=soporte@tu-dominio.com
```

---

## Actualizaciones Automáticas

### Deploy Automático en cada Push

Netlify detecta automáticamente los cambios en GitHub y hace deploy.

**Flujo:**

```
1. Haces cambios en el código
2. Git commit y push a GitHub
3. Netlify detecta el cambio
4. Inicia el build automáticamente
5. Deploy en 3-5 minutos
```

### Branch Preview

Netlify crea URLs de preview para cada branch o PR:

```
https://random-name--nombre-branch.netlify.app
```

### Configurar Branches

```
Site settings → Build & deploy → Branches
```

Agrega:

```yaml
Production branch: main
Preview branches: development/*
```

---

## Solución de Problemas

### Error: "Build failed"

**Problema:** El build falla

**Solución:**
```bash
# Verifica que el build funcione localmente
pnpm --filter @pos-pymes/shared build
pnpm --filter @pos-pymes/pos build

# Revisa los logs en Netlify
Deploys → Select failed deploy → View log
```

### Error: "Cannot find module"

**Problema:** Módulos no encontrados

**Solución:**
```toml
# En netlify.toml, asegura que tengas:
[build]
  command = "pnpm --filter @pos-pymes/shared build && pnpm --filter @pos-pymes/pos build"
```

### Error: "API not responding"

**Problema:** El frontend no puede conectar con la API

**Solución:**
1. Verifica que la API esté funcionando
2. Verifica la variable `NEXT_PUBLIC_API_URL`
3. Verifica CORS en la API

```bash
# Test de conexión
curl https://tu-api-url.com/api/health
```

### Error: "Page not found"

**Problema:** Páginas no encontradas

**Solución:**
```toml
# En netlify.toml:
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Problema: PWA no funciona

**Problema:** El service worker no se registra

**Solución:**
```toml
# Asegúrate de tener los headers correctos en netlify.toml:
[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
    Service-Worker-Allowed = "/"
```

---

## Optimizaciones

### 1. Activar Caché

```toml
[[headers]]
  for = "/_next/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### 2. Comprimir Assets

```toml
[build.processing]
  skip_processing = false

[build.processing.css]
  bundle = true
  minify = true

[build.processing.js]
  bundle = true
  minify = true
```

### 3. Imágenes Optimizadas

Netlify optimiza automáticamente las imágenes.

---

## Monitoreo

### Ver Logs

```
Deploys → Select deploy → View deploy log
```

### Funciones (si se usan)

```
Functions → Select function → View logs
```

### Analytics

Netlify proporciona analytics básicos en el plan gratuito.

---

## Seguridad

### HTTPS Automático

Netlify proporciona SSL gratuito con Let's Encrypt.

### Headers de Seguridad

Ya configurados en `netlify.toml`:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    # etc.
```

---

## Costos

### Plan Gratuito

- ✅ 100GB bandwidth/mes
- ✅ 300 minutos de build/mes
- ✅ SSL gratuito
- ✅ Deploy automático desde Git
- ✅ Preview deployments
- ✅ Forms (si se necesitan)

### Plan Pro ($19/mes)

- Más bandwidth
- Más minutos de build
- Rollbacks
- Analyses avanzados

---

## Resumen Rápido

### Deploy desde GitHub en 5 minutos:

```bash
# 1. Push a GitHub
git add .
git commit -m "Deploy a Netlify"
git push origin main

# 2. Configurar en Netlify Dashboard
# - Conectar GitHub
# - Seleccionar repositorio
# - Configurar build command
# - Agregar variables de entorno
# - Deploy!

# 3. ¡Listo!
```

---

## Recursos Adicionales

- [Documentación de Netlify](https://docs.netlify.com/)
- [Next.js en Netlify](https://docs.netlify.com/integrations/frameworks/next-js/)
- [Dominios en Netlify](https://docs.netlify.com/domains-https/custom-domains/)
- [Variables de Entorno](https://docs.netlify.com/site-deploys/environment-variables/)

---

## Soporte

Si tienes problemas:

1. Revisa los logs de deploy en Netlify
2. Verifica que la API esté funcionando
3. Verifica las variables de entorno
4. Consulta la documentación de Netlify
5. Abre un issue en GitHub

---

**¡Listo para hacer deploy en Netlify!** 🚀
