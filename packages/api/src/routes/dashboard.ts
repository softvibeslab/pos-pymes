import type { FastifyInstance } from 'fastify';
import { getDb } from '@pos-pymes/db';
import { eq, and, sql, desc } from 'drizzle-orm';
import { sales, products, credits, customers } from '@pos-pymes/db';
import { startOfDay, endOfDay } from '@pos-pymes/shared';

export async function dashboardRoutes(fastify: FastifyInstance) {
  // GET /api/dashboard/summary - Get daily summary
  fastify.get('/summary', async (request, reply) => {
    try {
      const db = getDb();
      const { date } = request.query as { date?: string };

      const targetDate = date ? new Date(date) : new Date();
      const dateStart = startOfDay(targetDate);
      const dateEnd = endOfDay(targetDate);

      // Get today's sales
      const todaySales = await db
        .select()
        .from(sales)
        .where(
          and(
            eq(sales.status, 'completed'),
            // Add date filtering for today
          )
        );

      const totalSales = todaySales.reduce((sum, sale) => sum + sale.total, 0);
      const totalTransactions = todaySales.length;
      const averageTicket = totalTransactions > 0 ? totalSales / totalTransactions : 0;

      // Calculate totals by payment method
      const cashTotal = todaySales
        .filter((s) => s.paymentMethod === 'cash')
        .reduce((sum, s) => sum + s.total, 0);
      const cardTotal = todaySales
        .filter((s) => s.paymentMethod === 'card')
        .reduce((sum, s) => sum + s.total, 0);
      const creditTotal = todaySales
        .filter((s) => s.paymentMethod === 'credit')
        .reduce((sum, s) => sum + s.total, 0);

      // Get pending credits
      const pendingCreditsResult = await db
        .select()
        .from(credits)
        .where(eq(credits.status, 'pending'));

      const pendingCredits = pendingCreditsResult.reduce((sum, credit) => sum + (credit.amount - credit.paidAmount), 0);

      // Get low stock products
      const lowStockProducts = await db
        .select()
        .from(products)
        .where(sql`${products.stockCurrent} <= ${products.stockMin}`);

      return reply.send({
        success: true,
        data: {
          date: dateStart,
          totalSales,
          totalProfit: 0, // TODO: Calculate based on cost prices
          totalTransactions,
          averageTicket,
          cashTotal,
          cardTotal,
          creditTotal,
          pendingCredits,
          lowStockProducts: lowStockProducts.length,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get summary',
        },
      });
    }
  });

  // GET /api/dashboard/sales - Get sales chart data
  fastify.get('/sales', async (request, reply) => {
    try {
      const db = getDb();
      const { period = '7d', startDate, endDate } = request.query as {
        period?: '7d' | '30d' | '90d' | '1y';
        startDate?: string;
        endDate?: string;
      };

      // Calculate date range
      let start: Date;
      let end: Date;

      if (startDate && endDate) {
        start = new Date(startDate);
        end = new Date(endDate);
      } else {
        end = new Date();
        start = new Date();

        switch (period) {
          case '7d':
            start.setDate(start.getDate() - 7);
            break;
          case '30d':
            start.setDate(start.getDate() - 30);
            break;
          case '90d':
            start.setDate(start.getDate() - 90);
            break;
          case '1y':
            start.setFullYear(start.getFullYear() - 1);
            break;
        }
      }

      // Get sales data grouped by day
      // This is a simplified version - in production, you'd want proper SQL grouping
      const salesData = await db
        .select()
        .from(sales)
        .where(
          and(
            eq(sales.status, 'completed'),
            // Add date range filtering
          )
        )
        .orderBy(desc(sales.createdAt));

      // Group by day
      const groupedByDay = salesData.reduce((acc, sale) => {
        const day = new Date(sale.createdAt).toISOString().split('T')[0];
        if (!acc[day]) {
          acc[day] = { sales: 0, transactions: 0 };
        }
        acc[day].sales += sale.total;
        acc[day].transactions += 1;
        return acc;
      }, {} as Record<string, { sales: number; transactions: number }>);

      const chartData = Object.entries(groupedByDay).map(([period, data]) => ({
        period,
        sales: data.sales,
        transactions: data.transactions,
      }));

      return reply.send({
        success: true,
        data: chartData,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get sales data',
        },
      });
    }
  });

  // GET /api/dashboard/profits - Get profitability data
  fastify.get('/profits', async (request, reply) => {
    try {
      const db = getDb();
      const { period = '30d', startDate, endDate } = request.query as {
        period?: '7d' | '30d' | '90d' | '1y';
        startDate?: string;
        endDate?: string;
      };

      // Calculate date range
      let start: Date;
      let end: Date;

      if (startDate && endDate) {
        start = new Date(startDate);
        end = new Date(endDate);
      } else {
        end = new Date();
        start = new Date();

        switch (period) {
          case '7d':
            start.setDate(start.getDate() - 7);
            break;
          case '30d':
            start.setDate(start.getDate() - 30);
            break;
          case '90d':
            start.setDate(start.getDate() - 90);
            break;
          case '1y':
            start.setFullYear(start.getFullYear() - 1);
            break;
        }
      }

      // Get sales with items to calculate profit
      // This is simplified - in production, you'd want a proper query with joins
      const salesData = await db
        .select()
        .from(sales)
        .where(
          and(
            eq(sales.status, 'completed'),
            // Add date range filtering
          )
        );

      // Calculate profit (simplified - needs actual cost prices from items)
      const revenue = salesData.reduce((sum, sale) => sum + sale.total, 0);
      const cost = revenue * 0.6; // Placeholder: 40% margin
      const profit = revenue - cost;
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

      // Group by period
      const groupedByDay = salesData.reduce((acc, sale) => {
        const day = new Date(sale.createdAt).toISOString().split('T')[0];
        if (!acc[day]) {
          acc[day] = { revenue: 0, cost: 0, profit: 0, margin: 0 };
        }
        const dayRevenue = sale.total;
        const dayCost = dayRevenue * 0.6; // Placeholder
        const dayProfit = dayRevenue - dayCost;

        acc[day].revenue += dayRevenue;
        acc[day].cost += dayCost;
        acc[day].profit += dayProfit;

        return acc;
      }, {} as Record<string, { revenue: number; cost: number; profit: number; margin: number }>);

      // Calculate margins
      Object.keys(groupedByDay).forEach((day) => {
        const data = groupedByDay[day];
        data.margin = data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0;
      });

      const chartData = Object.entries(groupedByDay).map(([period, data]) => ({
        period,
        ...data,
      }));

      return reply.send({
        success: true,
        data: {
          total: { revenue, cost, profit, margin },
          byPeriod: chartData,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get profits data',
        },
      });
    }
  });

  // GET /api/dashboard/inventory - Get inventory alerts
  fastify.get('/inventory', async (request, reply) => {
    try {
      const db = getDb();

      // Get low stock products
      const lowStockProducts = await db
        .select()
        .from(products)
        .where(sql`${products.stockCurrent} <= ${products.stockMin}`)
        .limit(50);

      // Format alerts
      const alerts = lowStockProducts.map((product) => ({
        id: product.id,
        type: 'low_stock' as const,
        productId: product.id,
        productName: product.name,
        currentStock: product.stockCurrent,
        minStock: product.stockMin,
        message: `${product.name} has low stock (${product.stockCurrent} / ${product.stockMin})`,
      }));

      return reply.send({
        success: true,
        data: {
          total: alerts.length,
          alerts,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get inventory alerts',
        },
      });
    }
  });

  // GET /api/dashboard/credits - Get credits overview
  fastify.get('/credits', async (request, reply) => {
    try {
      const db = getDb();

      // Get all credits
      const allCredits = await db.select().from(credits);

      // Calculate totals by status
      const pending = allCredits
        .filter((c) => c.status === 'pending')
        .reduce((sum, c) => sum + (c.amount - c.paidAmount), 0);
      const partial = allCredits
        .filter((c) => c.status === 'partial')
        .reduce((sum, c) => sum + (c.amount - c.paidAmount), 0);
      const paid = allCredits
        .filter((c) => c.status === 'paid')
        .reduce((sum, c) => sum + c.amount, 0);

      // Get overdue credits
      const today = new Date();
      const overdueCredits = allCredits.filter((c) => {
        return c.dueDate && new Date(c.dueDate) < today && c.status !== 'paid';
      });

      const overdue = overdueCredits.reduce((sum, c) => sum + (c.amount - c.paidAmount), 0);

      return reply.send({
        success: true,
        data: {
          pending,
          partial,
          paid,
          overdue,
          totalPending: pending + partial,
          overdueCount: overdueCredits.length,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get credits overview',
        },
      });
    }
  });
}
