import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

// Products Table
export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  barcode: text('barcode').notNull().unique(),
  name: text('name').notNull(),
  brand: text('brand'),
  categoryId: text('category_id'),
  unitType: text('unit_type').notNull(), // 'piece', 'weight', 'bulk'
  costPrice: real('cost_price'),
  salePrice: real('sale_price').notNull(),
  stockCurrent: integer('stock_current').notNull().default(0),
  stockMin: integer('stock_min').notNull().default(0),
  imageUrl: text('image_url'),
  isGlobal: integer('is_global', { mode: 'boolean' }).notNull().default(false),
  storeId: text('store_id'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
});

// Sales Table
export const sales = sqliteTable('sales', {
  id: text('id').primaryKey(),
  storeId: text('store_id').notNull(),
  userId: text('user_id').notNull(),
  total: real('total').notNull(),
  subtotal: real('subtotal').notNull(),
  tax: real('tax').notNull().default(0),
  discount: real('discount').notNull().default(0),
  paymentMethod: text('payment_method').notNull(), // 'cash', 'card', 'credit'
  cardLast4: text('card_last_4'),
  status: text('status').notNull(), // 'completed', 'cancelled', 'refunded'
  ticketNumber: text('ticket_number'),
  customerId: text('customer_id'),
  notes: text('notes'),
  syncedAt: integer('synced_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Sale Items Table
export const saleItems = sqliteTable('sale_items', {
  id: text('id').primaryKey(),
  saleId: text('sale_id').notNull().references(() => sales.id, { onDelete: 'cascade' }),
  productId: text('product_id').references(() => products.id),
  productName: text('product_name').notNull(),
  quantity: real('quantity').notNull(),
  unitPrice: real('unit_price').notNull(),
  subtotal: real('subtotal').notNull(),
  costPrice: real('cost_price'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Customers Table
export const customers = sqliteTable('customers', {
  id: text('id').primaryKey(),
  storeId: text('store_id').notNull(),
  name: text('name').notNull(),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  creditLimit: real('credit_limit').notNull().default(0),
  currentBalance: real('current_balance').notNull().default(0),
  whatsappEnabled: integer('whatsapp_enabled', { mode: 'boolean' }).notNull().default(false),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Credits Table
export const credits = sqliteTable('credits', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull().references(() => customers.id),
  saleId: text('sale_id').notNull().references(() => sales.id),
  amount: real('amount').notNull(),
  paidAmount: real('paid_amount').notNull().default(0),
  dueDate: integer('due_date', { mode: 'timestamp' }),
  status: text('status').notNull(), // 'pending', 'partial', 'paid', 'overdue'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  paidAt: integer('paid_at', { mode: 'timestamp' }),
});

// Cash Movements Table
export const cashMovements = sqliteTable('cash_movements', {
  id: text('id').primaryKey(),
  storeId: text('store_id').notNull(),
  userId: text('user_id').notNull(),
  type: text('type').notNull(), // 'opening', 'deposit', 'withdrawal', 'closing'
  amount: real('amount').notNull(),
  notes: text('notes'),
  shiftDate: integer('shift_date', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Cash Closings Table
export const cashClosings = sqliteTable('cash_closings', {
  id: text('id').primaryKey(),
  storeId: text('store_id').notNull(),
  userId: text('user_id').notNull(),
  shiftDate: integer('shift_date', { mode: 'timestamp' }).notNull(),
  openingAmount: real('opening_amount').notNull(),
  expectedCash: real('expected_cash').notNull(),
  countedCash: real('counted_cash').notNull(),
  difference: real('difference').notNull(),
  cardTotal: real('card_total').notNull().default(0),
  status: text('status').notNull(), // 'blind', 'verified'
  syncedAt: integer('synced_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Users Table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  storeId: text('store_id').notNull(),
  name: text('name').notNull(),
  email: text('email').unique(),
  pinHash: text('pin_hash').notNull(),
  role: text('role').notNull(), // 'owner', 'manager', 'cashier'
  permissions: text('permissions', { mode: 'json' }).$type<string[]>().notNull().$defaultFn(() => []),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  lastLoginAt: integer('last_login_at', { mode: 'timestamp' }),
});

// Audit Logs Table
export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  storeId: text('store_id').notNull(),
  userId: text('user_id').notNull(),
  action: text('action').notNull(), // 'sale_cancelled', 'drawer_opened', etc.
  entityType: text('entity_type'),
  entityId: text('entity_id'),
  details: text('details', { mode: 'json' }).$type<Record<string, any>>(),
  ipAddress: text('ip_address'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Inventory Alerts Table
export const inventoryAlerts = sqliteTable('inventory_alerts', {
  id: text('id').primaryKey(),
  storeId: text('store_id').notNull(),
  productId: text('product_id').references(() => products.id),
  alertType: text('alert_type').notNull(), // 'low_stock', 'expiring_soon', 'expired'
  thresholdValue: real('threshold_value'),
  currentValue: real('current_value'),
  expirationDate: integer('expiration_date', { mode: 'timestamp' }),
  resolved: integer('resolved', { mode: 'boolean' }).notNull().default(false),
  resolvedAt: integer('resolved_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Sync Queue Table (for offline-first synchronization)
export const syncQueue = sqliteTable('sync_queue', {
  id: text('id').primaryKey(),
  entityType: text('entity_type').notNull(),
  operation: text('operation').notNull(), // 'create', 'update', 'delete'
  entityId: text('entity_id').notNull(),
  data: text('data', { mode: 'json' }).$type<Record<string, any>>().notNull(),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  synced: integer('synced', { mode: 'boolean' }).notNull().default(false),
  attempts: integer('attempts').notNull().default(0),
  lastError: text('last_error'),
});

// Categories Table (optional, for product categorization)
export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  parentId: text('parent_id'),
  color: text('color'),
  icon: text('icon'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Relations
export const salesRelations = relations(sales, ({ many, one }) => ({
  items: many(saleItems),
  customer: one(customers, {
    fields: [sales.customerId],
    references: [customers.id],
  }),
}));

export const saleItemsRelations = relations(saleItems, ({ one }) => ({
  sale: one(sales, {
    fields: [saleItems.saleId],
    references: [sales.id],
  }),
  product: one(products, {
    fields: [saleItems.productId],
    references: [products.id],
  }),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  credits: many(credits),
}));

export const creditsRelations = relations(credits, ({ one }) => ({
  customer: one(customers, {
    fields: [credits.customerId],
    references: [customers.id],
  }),
  sale: one(sales, {
    fields: [credits.saleId],
    references: [sales.id],
  }),
}));

export const productsRelations = relations(products, ({ many, one }) => ({
  saleItems: many(saleItems),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many, one }) => ({
  products: many(products),
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
}));

// Export all schemas
export const schema = {
  products,
  sales,
  saleItems,
  customers,
  credits,
  cashMovements,
  cashClosings,
  users,
  auditLogs,
  inventoryAlerts,
  syncQueue,
  categories,
};

// Export types
export type Product = typeof products.$inferSelect;
export type ProductInsert = typeof products.$inferInsert;
export type Sale = typeof sales.$inferSelect;
export type SaleInsert = typeof sales.$inferInsert;
export type SaleItem = typeof saleItems.$inferSelect;
export type SaleItemInsert = typeof saleItems.$inferInsert;
export type Customer = typeof customers.$inferSelect;
export type CustomerInsert = typeof customers.$inferInsert;
export type Credit = typeof credits.$inferSelect;
export type CreditInsert = typeof credits.$inferInsert;
export type CashMovement = typeof cashMovements.$inferSelect;
export type CashMovementInsert = typeof cashMovements.$inferInsert;
export type CashClosing = typeof cashClosings.$inferSelect;
export type CashClosingInsert = typeof cashClosings.$inferInsert;
export type User = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type AuditLogInsert = typeof auditLogs.$inferInsert;
export type InventoryAlert = typeof inventoryAlerts.$inferSelect;
export type InventoryAlertInsert = typeof inventoryAlerts.$inferInsert;
export type SyncQueue = typeof syncQueue.$inferSelect;
export type SyncQueueInsert = typeof syncQueue.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type CategoryInsert = typeof categories.$inferInsert;
