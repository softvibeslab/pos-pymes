import Dexie, { Table } from 'dexie';
import type {
  Product,
  Sale,
  SaleItem,
  Customer,
  Credit,
  CashMovement,
  CashClosing,
  User,
} from '@pos-pymes/shared';

export class POSDatabase extends Dexie {
  products!: Table<Product>;
  sales!: Table<Sale>;
  saleItems!: Table<SaleItem>;
  customers!: Table<Customer>;
  credits!: Table<Credit>;
  cashMovements!: Table<CashMovement>;
  cashClosings!: Table<CashClosing>;
  users!: Table<User>;

  constructor() {
    super('pos-pymes-db');

    // Define schema
    this.version(1).stores({
      products: 'id, barcode, name, categoryId, isGlobal, storeId',
      sales: 'id, storeId, userId, status, paymentMethod, createdAt',
      saleItems: 'id, saleId, productId',
      customers: 'id, storeId, name, phone',
      credits: 'id, customerId, saleId, status',
      cashMovements: 'id, storeId, userId, type, shiftDate',
      cashClosings: 'id, storeId, userId, shiftDate',
      users: 'id, storeId, email, role, active',
    });
  }
}

export const db = new POSDatabase();

// Helper functions for common operations
export const dbHelpers = {
  // Products
  async getProducts(): Promise<Product[]> {
    return await db.products.where('deletedAt').equals(undefined as any).toArray();
  },

  async getProductById(id: string): Promise<Product | undefined> {
    return await db.products.get(id);
  },

  async getProductByBarcode(barcode: string): Promise<Product | undefined> {
    return await db.products.where('barcode').equals(barcode).first();
  },

  async addProduct(product: Product): Promise<string> {
    return await db.products.add(product);
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<number> {
    return await db.products.update(id, updates);
  },

  async deleteProduct(id: string): Promise<void> {
    await db.products.delete(id);
  },

  // Sales
  async getSales(): Promise<Sale[]> {
    return await db.sales.toArray();
  },

  async getSaleById(id: string): Promise<Sale | undefined> {
    return await db.sales.get(id);
  },

  async addSale(sale: Sale): Promise<string> {
    return await db.sales.add(sale);
  },

  // Sale Items
  async getSaleItems(saleId: string): Promise<SaleItem[]> {
    return await db.saleItems.where('saleId').equals(saleId).toArray();
  },

  async addSaleItem(item: SaleItem): Promise<string> {
    return await db.saleItems.add(item);
  },

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return await db.customers.toArray();
  },

  async getCustomerById(id: string): Promise<Customer | undefined> {
    return await db.customers.get(id);
  },

  async addCustomer(customer: Customer): Promise<string> {
    return await db.customers.add(customer);
  },

  // Credits
  async getCredits(): Promise<Credit[]> {
    return await db.credits.toArray();
  },

  async getCreditsByCustomer(customerId: string): Promise<Credit[]> {
    return await db.credits.where('customerId').equals(customerId).toArray();
  },

  // Cash Movements
  async getCashMovements(): Promise<CashMovement[]> {
    return await db.cashMovements.toArray();
  },

  async getCashMovementsByDate(date: Date): Promise<CashMovement[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await db.cashMovements
      .where('shiftDate')
      .between(startOfDay, endOfDay)
      .toArray();
  },

  // Users
  async getUsers(): Promise<User[]> {
    return await db.users.toArray();
  },

  async getUserById(id: string): Promise<User | undefined> {
    return await db.users.get(id);
  },

  async getUserByPIN(pin: string): Promise<User | undefined> {
    const users = await db.users.toArray();
    return users.find((u) => u.pinHash === pin && u.active);
  },
};
