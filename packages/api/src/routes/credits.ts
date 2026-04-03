import type { FastifyInstance } from 'fastify';
import { CreditPaymentSchema } from '@pos-pymes/shared';
import { generateId } from '@pos-pymes/shared';
import { getDb } from '@pos-pymes/db';
import { eq, and, sql } from 'drizzle-orm';
import { credits, customers, sales } from '@pos-pymes/db';

export async function creditsRoutes(fastify: FastifyInstance) {
  // GET /api/credits - List credits with pagination
  fastify.get('/', async (request, reply) => {
    try {
      const db = getDb();
      const { page = '1', pageSize = '20', status, customerId } = request.query as Record<string, string>;

      const offset = (parseInt(page) - 1) * parseInt(pageSize);

      let query = db.select().from(credits);

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
          message: 'Failed to fetch credits',
        },
      });
    }
  });

  // GET /api/credits/:id - Get credit by ID
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const db = getDb();

      const credit = await db.select().from(credits).where(eq(credits.id, id)).limit(1);

      if (!credit || credit.length === 0) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Credit not found',
          },
        });
      }

      return reply.send({
        success: true,
        data: credit[0],
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch credit',
        },
      });
    }
  });

  // POST /api/credits/:id/pay - Record payment for credit
  fastify.post('/:id/pay', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = CreditPaymentSchema.parse(request.body);

      const db = getDb();

      const credit = await db.select().from(credits).where(eq(credits.id, id)).limit(1);

      if (!credit || credit.length === 0) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Credit not found',
          },
        });
      }

      const currentCredit = credit[0];

      // Check if payment amount exceeds remaining balance
      const remainingBalance = currentCredit.amount - currentCredit.paidAmount;
      if (body.amount > remainingBalance) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Payment amount exceeds remaining balance',
            details: {
              remaining: remainingBalance,
              attempted: body.amount,
            },
          },
        });
      }

      // Update credit
      const newPaidAmount = currentCredit.paidAmount + body.amount;
      const isFullyPaid = newPaidAmount >= currentCredit.amount;

      await db
        .update(credits)
        .set({
          paidAmount: newPaidAmount,
          status: isFullyPaid ? 'paid' : 'partial',
          paidAt: isFullyPaid ? body.paymentDate : undefined,
        })
        .where(eq(credits.id, id));

      // Update customer balance
      await db
        .update(customers)
        .set({
          currentBalance: sql`${customers.currentBalance} - ${body.amount}`,
          updatedAt: new Date(),
        })
        .where(eq(customers.id, currentCredit.customerId));

      const updatedCredit = await db.select().from(credits).where(eq(credits.id, id)).limit(1);

      return reply.send({
        success: true,
        data: updatedCredit[0],
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to record payment',
        },
      });
    }
  });
}
