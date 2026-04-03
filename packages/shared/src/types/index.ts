// Core Types
export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
export interface JSONObject { [key: string]: JSONValue }
export interface JSONArray extends Array<JSONValue> {}

// Product Types
export type UnitType = 'piece' | 'weight' | 'bulk';

export interface Product {
  id: string;
  barcode: string;
  name: string;
  brand?: string;
  categoryId?: string;
  unitType: UnitType;
  costPrice?: number;
  salePrice: number;
  stockCurrent: number;
  stockMin: number;
  imageUrl?: string;
  isGlobal: boolean;
  storeId?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface ProductCreateInput {
  barcode: string;
  name: string;
  brand?: string;
  categoryId?: string;
  unitType: UnitType;
  costPrice?: number;
  salePrice: number;
  stockCurrent?: number;
  stockMin?: number;
  imageUrl?: string;
}

export interface ProductUpdateInput {
  name?: string;
  brand?: string;
  categoryId?: string;
  unitType?: UnitType;
  costPrice?: number;
  salePrice?: number;
  stockCurrent?: number;
  stockMin?: number;
  imageUrl?: string;
}

// Sale Types
export type PaymentMethod = 'cash' | 'card' | 'credit';
export type SaleStatus = 'completed' | 'cancelled' | 'refunded';

export interface SaleItem {
  id: string;
  saleId: string;
  productId?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  costPrice?: number;
  createdAt: Date;
}

export interface Sale {
  id: string;
  storeId: string;
  userId: string;
  total: number;
  subtotal: number;
  tax: number;
  discount: number;
  paymentMethod: PaymentMethod;
  cardLast4?: string;
  status: SaleStatus;
  ticketNumber?: string;
  syncedAt?: Date;
  createdAt: Date;
  items?: SaleItem[];
}

export interface SaleCreateInput {
  storeId: string;
  userId: string;
  items: Omit<SaleItem, 'id' | 'saleId' | 'createdAt'>[];
  paymentMethod: PaymentMethod;
  cardLast4?: string;
  discount?: number;
}

// Customer Types
export interface Customer {
  id: string;
  storeId: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  creditLimit: number;
  currentBalance: number;
  whatsappEnabled: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerCreateInput {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  creditLimit?: number;
  whatsappEnabled?: boolean;
  notes?: string;
}

// Credit Types
export type CreditStatus = 'pending' | 'partial' | 'paid' | 'overdue';

export interface Credit {
  id: string;
  customerId: string;
  saleId: string;
  amount: number;
  paidAmount: number;
  dueDate?: Date;
  status: CreditStatus;
  createdAt: Date;
  paidAt?: Date;
}

export interface CreditPaymentInput {
  amount: number;
  paymentDate: Date;
  notes?: string;
}

// Cash Management Types
export type CashMovementType = 'opening' | 'deposit' | 'withdrawal' | 'closing';
export type CashClosingStatus = 'blind' | 'verified';

export interface CashMovement {
  id: string;
  storeId: string;
  userId: string;
  type: CashMovementType;
  amount: number;
  notes?: string;
  shiftDate: Date;
  createdAt: Date;
}

export interface CashClosing {
  id: string;
  storeId: string;
  userId: string;
  shiftDate: Date;
  openingAmount: number;
  expectedCash: number;
  countedCash: number;
  difference: number;
  cardTotal: number;
  status: CashClosingStatus;
  syncedAt?: Date;
  createdAt: Date;
}

// User Types
export type UserRole = 'owner' | 'manager' | 'cashier';
export type Permission =
  | 'sales:create'
  | 'sales:cancel'
  | 'sales:refund'
  | 'products:create'
  | 'products:edit'
  | 'products:delete'
  | 'inventory:adjust'
  | 'cash:open'
  | 'cash:close'
  | 'cash:movements'
  | 'customers:create'
  | 'customers:edit'
  | 'customers:delete'
  | 'credits:create'
  | 'credits:collect'
  | 'reports:view'
  | 'users:manage'
  | 'settings:manage';

export interface User {
  id: string;
  storeId: string;
  name: string;
  email?: string;
  pinHash: string;
  role: UserRole;
  permissions: Permission[];
  active: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface UserCreateInput {
  name: string;
  email?: string;
  pin: string;
  role: UserRole;
  permissions?: Permission[];
}

export interface UserUpdateInput {
  name?: string;
  email?: string;
  pin?: string;
  role?: UserRole;
  permissions?: Permission[];
  active?: boolean;
}

// Audit Types
export interface AuditLog {
  id: string;
  storeId: string;
  userId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: JSONObject;
  ipAddress?: string;
  createdAt: Date;
}

// Inventory Alert Types
export type AlertType = 'low_stock' | 'expiring_soon' | 'expired';

export interface InventoryAlert {
  id: string;
  storeId: string;
  productId?: string;
  alertType: AlertType;
  thresholdValue?: number;
  currentValue?: number;
  expirationDate?: Date;
  resolved: boolean;
  resolvedAt?: Date;
  createdAt: Date;
}

// Dashboard Types
export interface DailySummary {
  date: Date;
  totalSales: number;
  totalProfit: number;
  totalTransactions: number;
  averageTicket: number;
  cashTotal: number;
  cardTotal: number;
  creditTotal: number;
  pendingCredits: number;
  lowStockProducts: number;
}

export interface SalesChartData {
  period: string;
  sales: number;
  transactions: number;
}

export interface ProfitabilityData {
  period: string;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: JSONObject;
  };
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Sync Types
export interface SyncOperation {
  id: string;
  entityType: string;
  operation: 'create' | 'update' | 'delete';
  data: JSONObject;
  timestamp: Date;
  synced: boolean;
}

export interface SyncConflict {
  id: string;
  entityType: string;
  entityId: string;
  localData: JSONObject;
  remoteData: JSONObject;
  conflictType: 'version' | 'delete' | 'field';
  timestamp: Date;
}
