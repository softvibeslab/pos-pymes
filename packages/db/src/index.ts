import drizzle from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

// Create SQLite database connection
let db: drizzle.BetterSQLite3Database | null = null;

export function getDb(dbPath: string = './local.db') {
  if (!db) {
    const sqlite = new Database(dbPath);
    db = drizzle(sqlite, { schema });
  }

  return db;
}

export function closeDb() {
  if (db) {
    (db as any).drizzle.client.close();
    db = null;
  }
}

// Export schema
export * from './schema';

// Export types
export type { Product, ProductInsert } from './schema';
export type { Sale, SaleInsert } from './schema';
export type { SaleItem, SaleItemInsert } from './schema';
export type { Customer, CustomerInsert } from './schema';
export type { Credit, CreditInsert } from './schema';
export type { CashMovement, CashMovementInsert } from './schema';
export type { CashClosing, CashClosingInsert } from './schema';
export type { User, UserInsert } from './schema';
export type { AuditLog, AuditLogInsert } from './schema';
export type { InventoryAlert, InventoryAlertInsert } from './schema';
export type { SyncQueue, SyncQueueInsert } from './schema';
export type { Category, CategoryInsert } from './schema';
