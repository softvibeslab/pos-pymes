import type { FastifyInstance } from 'fastify';
import { salesRoutes } from './sales.js';
import { productsRoutes } from './products.js';
import { customersRoutes } from './customers.js';
import { creditsRoutes } from './credits.js';
import { cashRoutes } from './cash.js';
import { dashboardRoutes } from './dashboard.js';
import { usersRoutes } from './users.js';

export async function routes(fastify: FastifyInstance) {
  // Register all route modules
  await fastify.register(salesRoutes, { prefix: '/sales' });
  await fastify.register(productsRoutes, { prefix: '/products' });
  await fastify.register(customersRoutes, { prefix: '/customers' });
  await fastify.register(creditsRoutes, { prefix: '/credits' });
  await fastify.register(cashRoutes, { prefix: '/cash' });
  await fastify.register(dashboardRoutes, { prefix: '/dashboard' });
  await fastify.register(usersRoutes, { prefix: '/users' });
}
