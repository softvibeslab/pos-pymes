import type { FastifyInstance } from 'fastify';
import { CustomerCreateSchema, CustomerUpdateSchema } from '@pos-pymes/shared';
import { generateId } from '@pos-pymes/shared';
import type { CustomerInsert } from '@pos-pymes/db';
import { getDb } from '@pos-pymes/db';
import { eq, like, or } from 'drizzle-orm';
import { customers } from '@pos-pymes/db';

export async function customersRoutes(fastify: FastifyInstance) {
  // GET /api/customers - List customers with pagination and filters
  fastify.get('/', async (request, reply) => {
    try {
      const db = getDb();
      const { page = '1', pageSize = '20', search, hasCredit } = request.query as Record<string, string>;

      const offset = (parseInt(page) - 1) * parseInt(pageSize);

      const results = await db
        .select()
        .from(customers)
        .limit(parseInt(pageSize))
        .offset(offset);

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
          message: 'Failed to fetch customers',
        },
      });
    }
  });

  // GET /api/customers/:id - Get customer by ID
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const db = getDb();

      const customer = await db.select().from(customers).where(eq(customers.id, id)).limit(1);

      if (!customer || customer.length === 0) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Customer not found',
          },
        });
      }

      return reply.send({
        success: true,
        data: customer[0],
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch customer',
        },
      });
    }
  });

  // POST /api/customers - Create new customer
  fastify.post('/', async (request, reply) => {
    try {
      const body = CustomerCreateSchema.parse(request.body);

      const db = getDb();

      const customerData: CustomerInsert = {
        id: generateId(),
        storeId: 'default-store', // TODO: Get from auth context
        name: body.name,
        phone: body.phone,
        email: body.email,
        address: body.address,
        creditLimit: body.creditLimit ?? 0,
        currentBalance: 0,
        whatsappEnabled: body.whatsappEnabled ?? false,
        notes: body.notes,
      };

      await db.insert(customers).values(customerData);

      const createdCustomer = await db
        .select()
        .from(customers)
        .where(eq(customers.id, customerData.id))
        .limit(1);

      return reply.status(201).send({
        success: true,
        data: createdCustomer[0],
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create customer',
        },
      });
    }
  });

  // PUT /api/customers/:id - Update customer
  fastify.put('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = CustomerUpdateSchema.parse(request.body);

      const db = getDb();

      const customer = await db.select().from(customers).where(eq(customers.id, id)).limit(1);

      if (!customer || customer.length === 0) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Customer not found',
          },
        });
      }

      await db
        .update(customers)
        .set({
          ...body,
          updatedAt: new Date(),
        })
        .where(eq(customers.id, id));

      const updatedCustomer = await db.select().from(customers).where(eq(customers.id, id)).limit(1);

      return reply.send({
        success: true,
        data: updatedCustomer[0],
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update customer',
        },
      });
    }
  });

  // DELETE /api/customers/:id - Delete customer
  fastify.delete('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const db = getDb();

      const customer = await db.select().from(customers).where(eq(customers.id, id)).limit(1);

      if (!customer || customer.length === 0) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Customer not found',
          },
        });
      }

      // Check if customer has unpaid credits
      if (customer[0].currentBalance > 0) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Cannot delete customer with unpaid credits',
          },
        });
      }

      await db.delete(customers).where(eq(customers.id, id));

      return reply.send({
        success: true,
        data: customer[0],
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete customer',
        },
      });
    }
  });
}
