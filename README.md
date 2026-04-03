# POS PyMES - Sistema de Punto de Venta para Tiendas de Barrio

Sistema integral de Punto de Venta (POS) y Dashboard de gestión para micronegocios minoristas en América Latina.

## Características

- **Offline-first**: Funcionamiento 100% local sin internet
- **Ultrarrapido**: Escaneo y cálculos en milisegundos
- **Zero-Setup**: Primera venta en <5 minutos
- **Integraciones**: Básculas (USB/RS-232), TPV (Mercado Pago/Clip)
- **Gestión de fiado**: Crédito local con estados de cuenta

## Stack Tecnológico

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Lenguaje**: TypeScript
- **UI**: Tailwind CSS + Radix UI
- **Estado**: Zustand
- **Persistencia**: IndexedDB (via Dexie.js)
- **PWA**: Service Workers para offline

### Backend
- **Runtime**: Node.js 20+ con TypeScript
- **Framework**: Fastify
- **ORM**: Drizzle ORM
- **Base de Datos**: SQLite (local)

## Estructura del Proyecto

```
pos_pymes/
├── apps/
│   ├── pos/                    # App POS (Next.js PWA)
│   └── dashboard/              # Dashboard Web (Next.js)
├── packages/
│   ├── api/                    # Backend API (Fastify)
│   ├── shared/                 # Código compartido
│   └── db/                     # Schema de BD (Drizzle)
└── infrastructure/
    ├── docker/                # Docker configs
    └── k8s/                   # Kubernetes manifests
```

## Instalación

### Prerrequisitos

- Node.js 20+
- pnpm 8+

### Pasos

1. Clonar el repositorio:
```bash
git clone <repo-url>
cd pos_pymes
```

2. Instalar dependencias:
```bash
pnpm install
```

3. Iniciar el servidor de desarrollo:
```bash
pnpm dev
```

4. Abrir en el navegador:
- POS App: http://localhost:3000
- API: http://localhost:3001
- Dashboard: http://localhost:3002

## Desarrollo

### Comandos Disponibles

```bash
# Desarrollo
pnpm dev              # Iniciar todas las apps en modo desarrollo

# Construcción
pnpm build            # Construir todas las apps

# Base de datos
pnpm db:generate      # Generar migraciones
pnpm db:migrate       # Ejecutar migraciones
pnpm db:push          # Hacer push del schema a la BD
pnpm db:studio        # Abrir Drizzle Studio

# Testing
pnpm test             # Ejecutar tests
pnpm lint             # Ejecutar linter
```

### Flujo de Trabajo

1. El código se organiza en un monorepo con Turborepo
2. Los cambios en `packages/shared` afectan a todas las apps
3. Los cambios en `packages/db` requieren regenerar el cliente
4. Las apps se comunican con la API vía REST

## Despliegue

### Docker

```bash
docker-compose up -d
```

### Producción

1. Construir las apps:
```bash
pnpm build
```

2. Iniciar el servidor:
```bash
pnpm start
```

## Documentación

- [API Documentation](./docs/api/README.md)
- [Deployment Guide](./docs/deployment/README.md)
- [Contributing](./CONTRIBUTING.md)

## Licencia

MIT

## Autores

- POS PyMES Team

## Soporte

Para soporte y consultas, abra un issue en el repositorio.
