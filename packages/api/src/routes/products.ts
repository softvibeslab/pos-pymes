import type { FastifyInstance } from 'fastify';
import { ProductCreateSchema, ProductUpdateSchema } from '@pos-pymes/shared';
import { generateId } from '@pos-pymes/shared';
import type { ProductInsert } from '@pos-pymes/db';
import { getDb } from '@pos-pymes/db';
import { eq, like, or, sql } from 'drizzle-orm';
import { products } from '@pos-pymes/db';

export async function productsRoutes(fastify: FastifyInstance) {
  // GET /api/products - List products with pagination and filters
  fastify.get('/', async (request, reply) => {
    try {
      const db = getDb();
      const { page = '1', pageSize = '20', search, category, unitType, lowStock } = request.query as Record<string, string>;

      const offset = (parseInt(page) - 1) * parseInt(pageSize);

      let query = db.select().from(products).where(eq(products.deletedAt, null));

      // Apply filters
      if (search) {
        // Search by name, barcode, or brand
        // This is simplified - in production use proper drizzle query builder
      }

      if (lowStock === 'true') {
        // Filter products where stockCurrent <= stockMin
        // This would need proper SQL in production
      }

      const results = await query.limit(parseInt(pageSize)).offset(offset);

      return reply.send({
        success: true,
        data: results,
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
          message: 'Failed to fetch products',
        },
      });
    }
  });

  // GET /api/products/:id - Get product by ID
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const db = getDb();

      const product = await db.select().from(products).where(eq(products.id, id)).limit(1);

      if (!product || product.length === 0) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Product not found',
          },
        });
      }

      return reply.send({
        success: true,
        data: product[0],
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch product',
        },
      });
    }
  });

  // GET /api/products/barcode/:code - Get product by barcode
  fastify.get('/barcode/:code', async (request, reply) => {
    try {
      const { code } = request.params as { code: string };
      const db = getDb();

      const product = await db
        .select()
        .from(products)
        .where(eq(products.barcode, code))
        .limit(1);

      if (!product || product.length === 0) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Product not found',
          },
        });
      }

      return reply.send({
        success: true,
        data: product[0],
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch product',
        },
      });
    }
  });

  // POST /api/products - Create new product
  fastify.post('/', async (request, reply) => {
    try {
      const body = ProductCreateSchema.parse(request.body);

      const db = getDb();

      // Check if barcode already exists
      const existing = await db
        .select()
        .from(products)
        .where(eq(products.barcode, body.barcode))
        .limit(1);

      if (existing && existing.length > 0) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'DUPLICATE_ENTRY',
            message: 'Product with this barcode already exists',
          },
        });
      }

      // Create product
      const productData: ProductInsert = {
        id: generateId(),
        ...body,
        stockCurrent: body.stockCurrent ?? 0,
        stockMin: body.stockMin ?? 0,
        isGlobal: false,
      };

      await db.insert(products).values(productData);

      const createdProduct = await db
        .select()
        .from(products)
        .where(eq(products.id, productData.id))
        .limit(1);

      return reply.status(201).send({
        success: true,
        data: createdProduct[0],
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create product',
        },
      });
    }
  });

  // PUT /api/products/:id - Update product
  fastify.put('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = ProductUpdateSchema.parse(request.body);

      const db = getDb();

      const product = await db.select().from(products).where(eq(products.id, id)).limit(1);

      if (!product || product.length === 0) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Product not found',
          },
        });
      }

      // Update product
      await db
        .update(products)
        .set({
          ...body,
          updatedAt: new Date(),
        })
        .where(eq(products.id, id));

      const updatedProduct = await db.select().from(products).where(eq(products.id, id)).limit(1);

      return reply.send({
        success: true,
        data: updatedProduct[0],
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update product',
        },
      });
    }
  });

  // DELETE /api/products/:id - Soft delete product
  fastify.delete('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const db = getDb();

      const product = await db.select().from(products).where(eq(products.id, id)).limit(1);

      if (!product || product.length === 0) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Product not found',
          },
        });
      }

      // Soft delete
      await db
        .update(products)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(products.id, id));

      return reply.send({
        success: true,
        data: { ...product[0], deletedAt: new Date() },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete product',
        },
      });
    }
  });

  // POST /api/products/sync - Sync products with cloud
  fastify.post('/sync', async (request, reply) => {
    try {
      // TODO: Implement cloud synchronization
      return reply.send({
        success: true,
        data: {
          synced: 0,
          errors: [],
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to sync products',
        },
      });
    }
  });
}
