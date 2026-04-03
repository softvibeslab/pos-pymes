# POS PyMES - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- **Node.js 20+** - [Download](https://nodejs.org/)
- **pnpm 8+** - Run: `npm install -g pnpm`

### Installation

```bash
# 1. Navigate to project directory
cd /root/pos_pymes

# 2. Run setup script
./scripts/setup.sh full

# 3. Start development servers
pnpm dev
```

### Access the Applications

- **POS App**: http://localhost:3000
- **API**: http://localhost:3001
- **API Health**: http://localhost:3001/health

### First Steps

1. **Open POS App** - Navigate to http://localhost:3000
2. **Login** - Use default PIN: `1234` (Admin)
3. **Add Products** - Click product cards or use search
4. **Complete Sale** - Click payment method and complete

### Default Credentials

- **Admin PIN**: `1234`
- **Cashier PIN**: `0000`

### Common Commands

```bash
# Development
pnpm dev                  # Start all services
pnpm --filter @pos-pymes/api dev     # API only
pnpm --filter @pos-pymes/pos dev     # POS only

# Database
pnpm db:generate          # Generate migrations
pnpm db:push              # Push schema to database
pnpm db:studio            # Open Drizzle Studio

# Building
pnpm build                # Build all packages
pnpm clean                # Clean build artifacts

# Docker
docker-compose up -d      # Start all containers
docker-compose down       # Stop all containers
```

### Project Structure

```
pos_pymes/
├── apps/
│   ├── pos/              # POS PWA Application
│   └── dashboard/        # Dashboard (TODO)
├── packages/
│   ├── api/              # Fastify Backend
│   ├── shared/           # Shared Types & Utils
│   └── db/               # Database Schema
└── scripts/
    └── setup.sh          # Setup Script
```

### What's Included

✅ **POS Application**
- Product grid with visual cards
- Barcode scanner support
- Shopping cart
- Payment processing (cash, card, credit)
- Offline support with PWA
- Local storage with IndexedDB

✅ **Backend API**
- RESTful API with Fastify
- SQLite database with Drizzle ORM
- Complete CRUD for all entities
- Authentication with PIN
- Role-based access control

✅ **Documentation**
- API documentation
- Deployment guide
- Implementation details

### Next Steps

1. **Add Products** - Use the API to add your products
2. **Customize** - Modify styling in `tailwind.config.ts`
3. **Deploy** - Follow deployment guide in `/docs/deployment`

### Troubleshooting

**Port already in use?**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

**Database errors?**
```bash
# Reinitialize database
rm local.db
pnpm db:push
```

**Module not found?**
```bash
# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Support

- 📖 Documentation: `/docs`
- 🔧 API Docs: `/docs/api/README.md`
- 🚀 Deployment: `/docs/deployment/README.md`
- 📝 Implementation: `IMPLEMENTATION.md`

### Features Coming Soon

- ⏳ Dashboard Application
- ⏳ Receipt Printing
- ⏳ Scale Integration
- ⏳ Payment Terminal Integration
- ⏳ Cloud Sync
- ⏳ Advanced Reporting

---

**Ready to sell?** Start the dev server and open http://localhost:3000! 🎉
