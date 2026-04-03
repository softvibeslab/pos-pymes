import Fastify from 'fastify';
import cors from '@fastify/cors';
import { routes } from './routes/index.js';

const server = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
});

// Register CORS
await server.register(cors, {
  origin: process.env.CORS_ORIGIN || true,
  credentials: true,
});

// Register routes
await server.register(routes, { prefix: '/api' });

// Health check
server.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3001', 10);
    const host = process.env.HOST || '0.0.0.0';

    await server.listen({ port, host });

    console.log(`🚀 Server ready at http://${host}:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

// Handle shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down gracefully...');
  await server.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n👋 Shutting down gracefully...');
  await server.close();
  process.exit(0);
});

// Start the server
start();
