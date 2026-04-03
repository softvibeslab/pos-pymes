# Deployment Guide - POS PyMES

This guide covers deploying the POS PyMES system in various environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [Production Deployment](#production-deployment)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 20+
- pnpm 8+
- Docker (optional, for containerized deployment)
- PostgreSQL (optional, for cloud database)

## Local Development

### 1. Clone the Repository

```bash
git clone <repo-url>
cd pos_pymes
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Initialize Database

```bash
pnpm db:generate
pnpm db:push
```

### 5. Seed Initial Data (Optional)

```bash
# This will create sample products and users
# TODO: Implement seed command
```

### 6. Start Development Servers

```bash
# Start all services
pnpm dev

# Or start individually
pnpm --filter @pos-pymes/api dev
pnpm --filter @pos-pymes/pos dev
pnpm --filter @pos-pymes/dashboard dev
```

### 7. Access Applications

- POS App: http://localhost:3000
- API: http://localhost:3001
- Dashboard: http://localhost:3002

## Docker Deployment

### Using Docker Compose (Recommended)

1. **Create Environment File**

```bash
cp .env.example .env
# Edit .env with production values
```

2. **Start All Services**

```bash
docker-compose up -d
```

3. **View Logs**

```bash
docker-compose logs -f
```

4. **Stop Services**

```bash
docker-compose down
```

### Manual Docker Build

#### Build API Image

```bash
cd infrastructure/docker
docker build -f Dockerfile.api -t pos-pymes-api:latest ../../
```

#### Build POS App Image

```bash
docker build -f Dockerfile.pos -t pos-pymes-pos:latest ../../
```

#### Run Containers

```bash
# API
docker run -d -p 3001:3001 --name pos-api pos-pymes-api:latest

# POS App
docker run -d -p 3000:3000 --name pos-pos pos-pymes-pos:latest
```

## Production Deployment

### Option 1: Self-Hosted with Docker

1. **Set Up Production Environment**

```bash
cp .env.example .env.production
# Edit with production values
```

2. **Build and Deploy**

```bash
docker-compose -f docker-compose.yml --env-file .env.production up -d
```

3. **Set Up Reverse Proxy (Nginx)**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /dashboard {
        proxy_pass http://localhost:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Option 2: Cloud Deployment (Vercel/Railway)

#### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Select `apps/pos` as root directory
3. Add environment variables:
   - `NEXT_PUBLIC_API_URL`: Your API URL
4. Deploy

#### API (Railway/Fly.io)

1. Connect your GitHub repository to Railway
2. Select `packages/api` as root directory
3. Add environment variables
4. Deploy

### Option 3: Kubernetes

```bash
kubectl apply -f infrastructure/k8s/
```

## Environment Variables

### API (.env)

```bash
# Server
PORT=3001
HOST=0.0.0.0
NODE_ENV=production

# CORS
CORS_ORIGIN=https://your-domain.com

# Database
DATABASE_PATH=/data/local.db

# Logging
LOG_LEVEL=info
```

### POS App (.env.local)

```bash
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

### Dashboard App (.env.local)

```bash
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

## Database Setup

### SQLite (Local/Default)

The system uses SQLite by default. No additional setup is required.

### PostgreSQL (Cloud)

To use PostgreSQL for cloud synchronization:

1. **Install PostgreSQL Client Library**

```bash
pnpm add -D pg @types/pg
```

2. **Update Database Configuration**

```typescript
// packages/db/src/index.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL);
export const db = drizzle(client);
```

3. **Set Environment Variable**

```bash
DATABASE_URL=postgresql://user:password@host:port/database
```

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 <PID>
```

#### Database Locked

```bash
# Remove database lock file
rm local.db-shm local.db-wal
```

#### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### Build Errors

```bash
# Clean all build artifacts
pnpm clean

# Rebuild
pnpm build
```

### Logging

- API logs: `packages/api/logs/`
- Application logs: Check browser console for frontend logs

### Health Checks

Check if services are running:

```bash
# API Health
curl http://localhost:3001/health

# POS App
curl http://localhost:3000

# Dashboard
curl http://localhost:3002
```

## Backup and Restore

### Backup SQLite Database

```bash
cp local.db backup/local-$(date +%Y%m%d-%H%M%S).db
```

### Restore Database

```bash
cp backup/local-YYYYMMDD-HHMMSS.db local.db
```

## Security Considerations

1. **Use HTTPS in production**
2. **Set strong PINs for users**
3. **Enable CORS only for trusted domains**
4. **Regular database backups**
5. **Keep dependencies updated**

## Monitoring

Consider setting up:

- **Error Tracking**: Sentry
- **Analytics**: Plausible/Google Analytics
- **Performance Monitoring**: Vercel Analytics
- **Uptime Monitoring**: UptimeRobot

## Support

For issues and questions:
- GitHub Issues: <repo-url>/issues
- Documentation: /docs
