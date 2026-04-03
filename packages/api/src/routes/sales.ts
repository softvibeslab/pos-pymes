import type { FastifyInstance } from 'fastify';
import { SaleCreateSchema, SaleCompleteSchema } from '@pos-pymes/shared';
import { generateId } from '@pos-pymes/shared';
import type { SaleInsert, SaleItemInsert } from '@pos-pymes/db';
import { getDb } from '@pos-pymes/db';
import { eq, and } from 'drizzle-orm';
import { sales, saleItems, products } from '@pos-pymes/db';

export async function salesRoutes(fastify: FastifyInstance) {
  // GET /api/sales - List sales with pagination and filters
  fastify.get('/', async (request, reply) => {
    try {
      const db = getDb();
      const { page = '1', pageSize = '20', startDate, endDate, status, userId, paymentMethod } = request.query as Record<string, string>;

      const offset = (parseInt(page) - 1) * parseInt(pageSize);

      let query = db.select().from(sales);

      // Apply filters if provided
      // Note: In production, you'd want to use drizzle's where clause builder properly

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
          message: 'Failed to fetch sales',
        },
      });
    }
  });

  // GET /api/sales/:id - Get sale by ID
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const db = getDb();

      const sale = await db.select().from(sales).where(eq(sales.id, id)).limit(1);

      if (!sale || sale.length === 0) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Sale not found',
          },
        });
      }

      // Get sale items
      const items = await db.select().from(saleItems).where(eq(saleItems.saleId, id));

      return reply.send({
        success: true,
        data: { ...sale[0], items },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch sale',
        },
      });
    }
  });

  // POST /api/sales - Create new sale
  fastify.post('/', async (request, reply) => {
    try {
      const body = SaleCreateSchema.parse(request.body);

      const db = getDb();

      // Check stock availability
      for (const item of body.items) {
        if (item.productId) {
          const product = await db
            .select()
            .from(products)
            .where(eq(products.id, item.productId))
            .limit(1);

          if (product && product.length > 0) {
            const currentStock = product[0].stockCurrent;
            if (currentStock < item.quantity) {
              return reply.status(400).send({
                success: false,
                error: {
                  code: 'INSUFFICIENT_STOCK',
                  message: `Insufficient stock for product: ${item.productName}`,
                  details: {
                    productId: item.productId,
                    requested: item.quantity,
                    available: currentStock,
                  },
                },
              });
            }
          }
        }
      }

      // Calculate totals
      const subtotal = body.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      const discount = body.discount || 0;
      const tax = 0; // TODO: Implement tax calculation
      const total = subtotal + tax - discount;

      // Create sale
      const saleId = generateId();
      const saleData: SaleInsert = {
        id: saleId,
        storeId: body.storeId,
        userId: body.userId,
        subtotal,
        tax,
        discount,
        total,
        paymentMethod: body.paymentMethod,
        cardLast4: body.cardLast4,
        status: 'completed',
      };

      await db.insert(sales).values(saleData);

      // Create sale items and update stock
      const itemsToInsert: SaleItemInsert[] = body.items.map((item) => ({
        id: generateId(),
        saleId,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.quantity * item.unitPrice,
        costPrice: item.costPrice,
      }));

      await db.insert(saleItems).values(itemsToInsert);

      // Update product stock
      for (const item of body.items) {
        if (item.productId) {
          await db
            .update(products)
            .set({
              stockCurrent: sql`${products.stockCurrent} - ${item.quantity}`,
              updatedAt: new Date(),
            })
            .where(eq(products.id, item.productId));
        }
      }

      // Fetch complete sale with items
      const createdSale = await db.select().from(sales).where(eq(sales.id, saleId)).limit(1);
      const createdItems = await db.select().from(saleItems).where(eq(saleItems.saleId, saleId));

      return reply.status(201).send({
        success: true,
        data: { ...createdSale[0], items: createdItems },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create sale',
        },
      });
    }
  });

  // DELETE /api/sales/:id - Cancel sale
  fastify.delete('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const db = getDb();

      const sale = await db.select().from(sales).where(eq(sales.id, id)).limit(1);

      if (!sale || sale.length === 0) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Sale not found',
          },
        });
      }

      if (sale[0].status === 'cancelled') {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Sale is already cancelled',
          },
        });
      }

      // Update sale status
      await db.update(sales).set({ status: 'cancelled' }).where(eq(sales.id, id));

      // Restore stock
      const items = await db.select().from(saleItems).where(eq(saleItems.saleId, id));
      for (const item of items) {
        if (item.productId) {
          await db
            .update(products)
            .set({
              stockCurrent: sql`${products.stockCurrent} + ${item.quantity}`,
              updatedAt: new Date(),
            })
            .where(eq(products.id, item.productId));
        }
      }

      return reply.send({
        success: true,
        data: { ...sale[0], status: 'cancelled' },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to cancel sale',
        },
      });
    }
  });

  // POST /api/sales/:id/complete - Complete sale with customer and notes
  fastify.post('/:id/complete', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = SaleCompleteSchema.parse(request.body);

      const db = getDb();

      const sale = await db.select().from(sales).where(eq(sales.id, id)).limit(1);

      if (!sale || sale.length === 0) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Sale not found',
          },
        });
      }

      // Update sale with customer info
      await db
        .update(sales)
        .set({
          customerId: body.customerId,
          notes: body.notes,
        })
        .where(eq(sales.id, id));

      // If credit payment, create credit record
      if (sale[0].paymentMethod === 'credit' && body.customerId) {
        const creditData = {
          id: generateId(),
          customerId: body.customerId,
          saleId: id,
          amount: sale[0].total,
          paidAmount: 0,
          status: 'pending' as const,
        };

        await db.insert(credits).values(creditData);

        // Update customer balance
        await db
          .update(customers)
          .set({
            currentBalance: sql`${customers.currentBalance} + ${sale[0].total}`,
            updatedAt: new Date(),
          })
          .where(eq(customers.id, body.customerId));
      }

      const updatedSale = await db.select().from(sales).where(eq(sales.id, id)).limit(1);
      const items = await db.select().from(saleItems).where(eq(saleItems.saleId, id));

      return reply.send({
        success: true,
        data: { ...updatedSale[0], items },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to complete sale',
        },
      });
    }
  });
}
