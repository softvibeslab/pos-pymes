import type { FastifyInstance } from 'fastify';
import { UserCreateSchema, UserUpdateSchema, UserLoginSchema } from '@pos-pymes/shared';
import { generateId, hashPIN } from '@pos-pymes/shared';
import type { UserInsert } from '@pos-pymes/db';
import { getDb } from '@pos-pymes/db';
import { eq } from 'drizzle-orm';
import { users } from '@pos-pymes/db';

export async function usersRoutes(fastify: FastifyInstance) {
  // POST /api/users/login - Login with PIN
  fastify.post('/login', async (request, reply) => {
    try {
      const body = UserLoginSchema.parse(request.body);

      const db = getDb();

      // Find user by PIN
      const allUsers = await db.select().from(users);
      const user = allUsers.find((u) => u.pinHash === body.pin && u.active);

      if (!user) {
        return reply.status(401).send({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid PIN or user inactive',
          },
        });
      }

      // Update last login
      await db
        .update(users)
        .set({
          lastLoginAt: new Date(),
        })
        .where(eq(users.id, user.id));

      // Return user without PIN hash
      const { pinHash, ...userWithoutPin } = user;

      return reply.send({
        success: true,
        data: userWithoutPin,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to login',
        },
      });
    }
  });

  // GET /api/users - List users
  fastify.get('/', async (request, reply) => {
    try {
      const db = getDb();
      const { page = '1', pageSize = '20', active } = request.query as Record<string, string>;

      const offset = (parseInt(page) - 1) * parseInt(pageSize);

      let query = db.select().from(users);

      const results = await query.limit(parseInt(pageSize)).offset(offset);

      // Remove PIN hashes from response
      const sanitizedResults = results.map(({ pinHash, ...user }) => user);

      return reply.send({
        success: true,
        data: sanitizedResults,
        meta: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch users',
        },
      });
    }
  });

  // GET /api/users/:id - Get user by ID
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const db = getDb();

      const user = await db.select().from(users).where(eq(users.id, id)).limit(1);

      if (!user || user.length === 0) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'User not found',
          },
        });
      }

      // Remove PIN hash from response
      const { pinHash, ...userWithoutPin } = user[0];

      return reply.send({
        success: true,
        data: userWithoutPin,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch user',
        },
      });
    }
  });

  // POST /api/users - Create new user
  fastify.post('/', async (request, reply) => {
    try {
      const body = UserCreateSchema.parse(request.body);
      const { storeId = 'default-store' } = request.query as { storeId?: string };

      const db = getDb();

      // Check if email already exists
      if (body.email) {
        const existing = await db.select().from(users).where(eq(users.email, body.email)).limit(1);
        if (existing && existing.length > 0) {
          return reply.status(400).send({
            success: false,
            error: {
              code: 'DUPLICATE_ENTRY',
              message: 'User with this email already exists',
            },
          });
        }
      }

      // Hash PIN
      const pinHash = hashPIN(body.pin);

      // Create user
      const userData: UserInsert = {
        id: generateId(),
        storeId,
        name: body.name,
        email: body.email,
        pinHash,
        role: body.role,
        permissions: body.permissions || [],
        active: true,
      };

      await db.insert(users).values(userData);

      // Remove PIN hash from response
      const { pinHash: _, ...userWithoutPin } = userData;

      return reply.status(201).send({
        success: true,
        data: userWithoutPin,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create user',
        },
      });
    }
  });

  // PUT /api/users/:id - Update user
  fastify.put('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = UserUpdateSchema.parse(request.body);

      const db = getDb();

      const user = await db.select().from(users).where(eq(users.id, id)).limit(1);

      if (!user || user.length === 0) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'User not found',
          },
        });
      }

      // Prepare update data
      const updateData: Partial<UserInsert> = {
        ...body,
      };

      // Hash new PIN if provided
      if (body.pin) {
        updateData.pinHash = hashPIN(body.pin);
      }

      await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, id));

      const updatedUser = await db.select().from(users).where(eq(users.id, id)).limit(1);

      // Remove PIN hash from response
      const { pinHash, ...userWithoutPin } = updatedUser[0];

      return reply.send({
        success: true,
        data: userWithoutPin,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update user',
        },
      });
    }
  });

  // DELETE /api/users/:id - Deactivate user
  fastify.delete('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const db = getDb();

      const user = await db.select().from(users).where(eq(users.id, id)).limit(1);

      if (!user || user.length === 0) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'User not found',
          },
        });
      }

      // Deactivate user
      await db
        .update(users)
        .set({
          active: false,
        })
        .where(eq(users.id, id));

      // Remove PIN hash from response
      const { pinHash, ...userWithoutPin } = user[0];

      return reply.send({
        success: true,
        data: { ...userWithoutPin, active: false },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to deactivate user',
        },
      });
    }
  });
}
