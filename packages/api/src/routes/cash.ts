import type { FastifyInstance } from 'fastify';
import { CashMovementCreateSchema, CashClosingCreateSchema, CashClosingVerifySchema } from '@pos-pymes/shared';
import { generateId } from '@pos-pymes/shared';
import type { CashMovementInsert, CashClosingInsert } from '@pos-pymes/db';
import { getDb } from '@pos-pymes/db';
import { eq, desc, sql } from 'drizzle-orm';
import { cashMovements, cashClosings, sales } from '@pos-pymes/db';
import { startOfDay, endOfDay } from '@pos-pymes/shared';

export async function cashRoutes(fastify: FastifyInstance) {
  // POST /api/cash/open - Open cash drawer
  fastify.post('/open', async (request, reply) => {
    try {
      const { amount, userId, storeId = 'default-store' } = request.body as {
        amount: number;
        userId: string;
        storeId?: string;
      };

      const db = getDb();

      // Check if cash is already open for today
      const today = new Date();
      const existing = await db
        .select()
        .from(cashMovements)
        .where(eq(cashMovements.type, 'opening'))
        .orderBy(desc(cashMovements.createdAt))
        .limit(1);

      if (existing && existing.length > 0 && isToday(existing[0].createdAt)) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'CASH_ALREADY_OPEN',
            message: 'Cash drawer is already open for today',
          },
        });
      }

      // Create opening movement
      const movementData: CashMovementInsert = {
        id: generateId(),
        storeId,
        userId,
        type: 'opening',
        amount,
        shiftDate: startOfDay(today),
      };

      await db.insert(cashMovements).values(movementData);

      return reply.status(201).send({
        success: true,
        data: movementData,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to open cash drawer',
        },
      });
    }
  });

  // POST /api/cash/movements - Create cash movement (deposit/withdrawal)
  fastify.post('/movements', async (request, reply) => {
    try {
      const body = CashMovementCreateSchema.parse(request.body);
      const { userId, storeId = 'default-store' } = request.query as { userId: string; storeId?: string };

      const db = getDb();

      // Check if cash is open
      const opening = await db
        .select()
        .from(cashMovements)
        .where(eq(cashMovements.type, 'opening'))
        .orderBy(desc(cashMovements.createdAt))
        .limit(1);

      if (!opening || opening.length === 0 || !isToday(opening[0].createdAt)) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'CASH_NOT_OPEN',
            message: 'Cash drawer is not open',
          },
        });
      }

      // Create movement
      const movementData: CashMovementInsert = {
        id: generateId(),
        storeId,
        userId,
        type: body.type,
        amount: body.amount,
        notes: body.notes,
        shiftDate: startOfDay(new Date()),
      };

      await db.insert(cashMovements).values(movementData);

      return reply.status(201).send({
        success: true,
        data: movementData,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create cash movement',
        },
      });
    }
  });

  // POST /api/cash/close - Close cash drawer (blind closing)
  fastify.post('/close', async (request, reply) => {
    try {
      const { userId, storeId = 'default-store' } = request.query as { userId: string; storeId?: string };
      const body = CashClosingCreateSchema.parse(request.body);

      const db = getDb();

      // Get opening movement
      const opening = await db
        .select()
        .from(cashMovements)
        .where(eq(cashMovements.type, 'opening'))
        .orderBy(desc(cashMovements.createdAt))
        .limit(1);

      if (!opening || opening.length === 0) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'CASH_NOT_OPEN',
            message: 'No cash drawer opening found',
          },
        });
      }

      // Calculate expected cash
      const todayStart = startOfDay(new Date());
      const todayEnd = endOfDay(new Date());

      // Get all cash sales today
      const cashSales = await db
        .select()
        .from(sales)
        .where(
          and(
            eq(sales.paymentMethod, 'cash'),
            eq(sales.status, 'completed'),
            // Add date filtering
          )
        );

      const totalCashSales = cashSales.reduce((sum, sale) => sum + sale.total, 0);

      // Get other movements
      const movements = await db
        .select()
        .from(cashMovements)
        .where(eq(cashMovements.shiftDate, todayStart));

      const deposits = movements
        .filter((m) => m.type === 'deposit')
        .reduce((sum, m) => sum + m.amount, 0);
      const withdrawals = movements
        .filter((m) => m.type === 'withdrawal')
        .reduce((sum, m) => sum + m.amount, 0);

      const expectedCash = opening[0].amount + totalCashSales + deposits - withdrawals;
      const difference = body.countedCash - expectedCash;

      // Create closing record (blind)
      const closingData: CashClosingInsert = {
        id: generateId(),
        storeId,
        userId,
        shiftDate: todayStart,
        openingAmount: opening[0].amount,
        expectedCash,
        countedCash: body.countedCash,
        difference,
        cardTotal: body.cardTotal ?? 0,
        status: 'blind',
      };

      await db.insert(cashClosings).values(closingData);

      // Create closing movement
      await db.insert(cashMovements).values({
        id: generateId(),
        storeId,
        userId,
        type: 'closing',
        amount: body.countedCash,
        shiftDate: todayStart,
      });

      return reply.status(201).send({
        success: true,
        data: closingData,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to close cash drawer',
        },
      });
    }
  });

  // POST /api/cash/verify - Verify closing and update to verified status
  fastify.post('/verify/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = CashClosingVerifySchema.parse(request.body);

      const db = getDb();

      const closing = await db.select().from(cashClosings).where(eq(cashClosings.id, id)).limit(1);

      if (!closing || closing.length === 0) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Closing not found',
          },
        });
      }

      // Recalculate difference
      const difference = body.countedCash - closing[0].expectedCash;

      // Update closing
      await db
        .update(cashClosings)
        .set({
          countedCash: body.countedCash,
          cardTotal: body.cardTotal ?? closing[0].cardTotal,
          difference,
          status: 'verified',
        })
        .where(eq(cashClosings.id, id));

      const updatedClosing = await db.select().from(cashClosings).where(eq(cashClosings.id, id)).limit(1);

      return reply.send({
        success: true,
        data: updatedClosing[0],
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to verify closing',
        },
      });
    }
  });

  // GET /api/cash/report/:date - Get cash report for a specific date
  fastify.get('/report/:date', async (request, reply) => {
    try {
      const { date } = request.params as { date: string };
      const db = getDb();

      const reportDate = new Date(date);
      const dateStart = startOfDay(reportDate);
      const dateEnd = endOfDay(reportDate);

      // Get opening
      const opening = await db
        .select()
        .from(cashMovements)
        .where(
          and(
            eq(cashMovements.type, 'opening'),
            eq(cashMovements.shiftDate, dateStart)
          )
        )
        .limit(1);

      // Get closing
      const closing = await db
        .select()
        .from(cashClosings)
        .where(eq(cashClosings.shiftDate, dateStart))
        .limit(1);

      // Get all movements
      const movements = await db
        .select()
        .from(cashMovements)
        .where(eq(cashMovements.shiftDate, dateStart));

      // Get sales
      const sales = await db
        .select()
        .from(sales)
        .where(
          and(
            eq(sales.status, 'completed'),
            // Add date filtering
          )
        );

      const cashSales = sales.filter((s) => s.paymentMethod === 'cash').reduce((sum, s) => sum + s.total, 0);
      const cardSales = sales.filter((s) => s.paymentMethod === 'card').reduce((sum, s) => sum + s.total, 0);
      const creditSales = sales.filter((s) => s.paymentMethod === 'credit').reduce((sum, s) => sum + s.total, 0);

      const deposits = movements
        .filter((m) => m.type === 'deposit')
        .reduce((sum, m) => sum + m.amount, 0);
      const withdrawals = movements
        .filter((m) => m.type === 'withdrawal')
        .reduce((sum, m) => sum + m.amount, 0);

      return reply.send({
        success: true,
        data: {
          date: dateStart,
          opening: opening[0]?.amount || 0,
          cashSales,
          cardSales,
          creditSales,
          deposits,
          withdrawals,
          closing: closing[0],
          movements: movements.filter((m) => m.type !== 'opening' && m.type !== 'closing'),
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get cash report',
        },
      });
    }
  });
}

// Helper function to check if date is today
function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}
