import { z } from 'zod';

// Base Enums
export const UnitTypeEnum = z.enum(['piece', 'weight', 'bulk']);
export const PaymentMethodEnum = z.enum(['cash', 'card', 'credit']);
export const SaleStatusEnum = z.enum(['completed', 'cancelled', 'refunded']);
export const CreditStatusEnum = z.enum(['pending', 'partial', 'paid', 'overdue']);
export const CashMovementTypeEnum = z.enum(['opening', 'deposit', 'withdrawal', 'closing']);
export const CashClosingStatusEnum = z.enum(['blind', 'verified']);
export const UserRoleEnum = z.enum(['owner', 'manager', 'cashier']);
export const AlertTypeEnum = z.enum(['low_stock', 'expiring_soon', 'expired']);

// Product Validations
export const ProductSchema = z.object({
  id: z.string().uuid(),
  barcode: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  brand: z.string().max(100).optional(),
  categoryId: z.string().uuid().optional(),
  unitType: UnitTypeEnum,
  costPrice: z.number().nonnegative().optional(),
  salePrice: z.number().positive(),
  stockCurrent: z.number().nonnegative(),
  stockMin: z.number().nonnegative(),
  imageUrl: z.string().url().optional(),
  isGlobal: z.boolean(),
  storeId: z.string().uuid().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().optional(),
});

export const ProductCreateSchema = z.object({
  barcode: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  brand: z.string().max(100).optional(),
  categoryId: z.string().uuid().optional(),
  unitType: UnitTypeEnum,
  costPrice: z.number().nonnegative().optional(),
  salePrice: z.number().positive(),
  stockCurrent: z.number().nonnegative().optional(),
  stockMin: z.number().nonnegative().optional(),
  imageUrl: z.string().url().optional(),
});

export const ProductUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  brand: z.string().max(100).optional(),
  categoryId: z.string().uuid().optional(),
  unitType: UnitTypeEnum.optional(),
  costPrice: z.number().nonnegative().optional(),
  salePrice: z.number().positive().optional(),
  stockCurrent: z.number().nonnegative().optional(),
  stockMin: z.number().nonnegative().optional(),
  imageUrl: z.string().url().optional(),
});

// Sale Validations
export const SaleItemSchema = z.object({
  id: z.string().uuid(),
  saleId: z.string().uuid(),
  productId: z.string().uuid().optional(),
  productName: z.string().min(1).max(200),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  subtotal: z.number().nonnegative(),
  costPrice: z.number().nonnegative().optional(),
  createdAt: z.date(),
});

export const SaleCreateSchema = z.object({
  storeId: z.string().uuid(),
  userId: z.string().uuid(),
  items: z.array(z.object({
    productId: z.string().uuid().optional(),
    productName: z.string().min(1).max(200),
    quantity: z.number().positive(),
    unitPrice: z.number().nonnegative(),
    costPrice: z.number().nonnegative().optional(),
  })),
  paymentMethod: PaymentMethodEnum,
  cardLast4: z.string().regex(/^\d{4}$/).optional(),
  discount: z.number().nonnegative().optional(),
});

export const SaleCompleteSchema = z.object({
  customerId: z.string().uuid().optional(),
  discount: z.number().nonnegative().optional(),
  notes: z.string().max(500).optional(),
});

// Customer Validations
export const CustomerSchema = z.object({
  id: z.string().uuid(),
  storeId: z.string().uuid(),
  name: z.string().min(1).max(200),
  phone: z.string().regex(/^\+?\d{10,15}$/).optional(),
  email: z.string().email().optional(),
  address: z.string().max(500).optional(),
  creditLimit: z.number().nonnegative(),
  currentBalance: z.number().nonnegative(),
  whatsappEnabled: z.boolean(),
  notes: z.string().max(1000).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CustomerCreateSchema = z.object({
  name: z.string().min(1).max(200),
  phone: z.string().regex(/^\+?\d{10,15}$/).optional(),
  email: z.string().email().optional(),
  address: z.string().max(500).optional(),
  creditLimit: z.number().nonnegative().optional(),
  whatsappEnabled: z.boolean().optional(),
  notes: z.string().max(1000).optional(),
});

export const CustomerUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  phone: z.string().regex(/^\+?\d{10,15}$/).optional(),
  email: z.string().email().optional(),
  address: z.string().max(500).optional(),
  creditLimit: z.number().nonnegative().optional(),
  whatsappEnabled: z.boolean().optional(),
  notes: z.string().max(1000).optional(),
});

// Credit Validations
export const CreditSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid(),
  saleId: z.string().uuid(),
  amount: z.number().positive(),
  paidAmount: z.number().nonnegative(),
  dueDate: z.date().optional(),
  status: CreditStatusEnum,
  createdAt: z.date(),
  paidAt: z.date().optional(),
});

export const CreditPaymentSchema = z.object({
  amount: z.number().positive(),
  paymentDate: z.date(),
  notes: z.string().max(500).optional(),
});

// Cash Management Validations
export const CashMovementSchema = z.object({
  id: z.string().uuid(),
  storeId: z.string().uuid(),
  userId: z.string().uuid(),
  type: CashMovementTypeEnum,
  amount: z.number().nonnegative(),
  notes: z.string().max(500).optional(),
  shiftDate: z.date(),
  createdAt: z.date(),
});

export const CashMovementCreateSchema = z.object({
  type: CashMovementTypeEnum,
  amount: z.number().nonnegative(),
  notes: z.string().max(500).optional(),
});

export const CashClosingSchema = z.object({
  id: z.string().uuid(),
  storeId: z.string().uuid(),
  userId: z.string().uuid(),
  shiftDate: z.date(),
  openingAmount: z.number().nonnegative(),
  expectedCash: z.number().nonnegative(),
  countedCash: z.number().nonnegative(),
  difference: z.number(),
  cardTotal: z.number().nonnegative(),
  status: CashClosingStatusEnum,
  syncedAt: z.date().optional(),
  createdAt: z.date(),
});

export const CashClosingCreateSchema = z.object({
  openingAmount: z.number().nonnegative(),
  countedCash: z.number().nonnegative(),
  cardTotal: z.number().nonnegative().optional(),
});

export const CashClosingVerifySchema = z.object({
  countedCash: z.number().nonnegative(),
  cardTotal: z.number().nonnegative().optional(),
});

// User Validations
export const PermissionEnum = z.enum([
  'sales:create',
  'sales:cancel',
  'sales:refund',
  'products:create',
  'products:edit',
  'products:delete',
  'inventory:adjust',
  'cash:open',
  'cash:close',
  'cash:movements',
  'customers:create',
  'customers:edit',
  'customers:delete',
  'credits:create',
  'credits:collect',
  'reports:view',
  'users:manage',
  'settings:manage',
]);

export const UserSchema = z.object({
  id: z.string().uuid(),
  storeId: z.string().uuid(),
  name: z.string().min(1).max(200),
  email: z.string().email().optional(),
  pinHash: z.string(),
  role: UserRoleEnum,
  permissions: z.array(PermissionEnum),
  active: z.boolean(),
  createdAt: z.date(),
  lastLoginAt: z.date().optional(),
});

export const UserCreateSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().optional(),
  pin: z.string().regex(/^\d{4,6}$/),
  role: UserRoleEnum,
  permissions: z.array(PermissionEnum).optional(),
});

export const UserUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().optional(),
  pin: z.string().regex(/^\d{4,6}$/).optional(),
  role: UserRoleEnum.optional(),
  permissions: z.array(PermissionEnum).optional(),
  active: z.boolean().optional(),
});

export const UserLoginSchema = z.object({
  pin: z.string().regex(/^\d{4,6}$/),
});

// Audit Log Schema
export const AuditLogSchema = z.object({
  id: z.string().uuid(),
  storeId: z.string().uuid(),
  userId: z.string().uuid(),
  action: z.string().min(1).max(100),
  entityType: z.string().max(50).optional(),
  entityId: z.string().uuid().optional(),
  details: z.record(z.any()).optional(),
  ipAddress: z.string().ip().optional(),
  createdAt: z.date(),
});

// Inventory Alert Schema
export const InventoryAlertSchema = z.object({
  id: z.string().uuid(),
  storeId: z.string().uuid(),
  productId: z.string().uuid().optional(),
  alertType: AlertTypeEnum,
  thresholdValue: z.number().optional(),
  currentValue: z.number().optional(),
  expirationDate: z.date().optional(),
  resolved: z.boolean(),
  resolvedAt: z.date().optional(),
  createdAt: z.date(),
});

// Query Param Validations
export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const ProductFilterSchema = PaginationSchema.extend({
  search: z.string().optional(),
  category: z.string().uuid().optional(),
  unitType: UnitTypeEnum.optional(),
  lowStock: z.coerce.boolean().optional(),
});

export const SalesFilterSchema = PaginationSchema.extend({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  status: SaleStatusEnum.optional(),
  paymentMethod: PaymentMethodEnum.optional(),
  userId: z.string().uuid().optional(),
});

export const CustomerFilterSchema = PaginationSchema.extend({
  search: z.string().optional(),
  hasCredit: z.coerce.boolean().optional(),
});

// API Response Wrappers
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.object({
      code: z.string(),
      message: z.string(),
      details: z.record(z.any()).optional(),
    }).optional(),
    meta: z.object({
      total: z.number().optional(),
      page: z.number().optional(),
      pageSize: z.number().optional(),
    }).optional(),
  });

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
    totalPages: z.number(),
  });

// Export all schemas
export const Validations = {
  Product: ProductSchema,
  ProductCreate: ProductCreateSchema,
  ProductUpdate: ProductUpdateSchema,
  SaleItem: SaleItemSchema,
  SaleCreate: SaleCreateSchema,
  SaleComplete: SaleCompleteSchema,
  Customer: CustomerSchema,
  CustomerCreate: CustomerCreateSchema,
  CustomerUpdate: CustomerUpdateSchema,
  Credit: CreditSchema,
  CreditPayment: CreditPaymentSchema,
  CashMovement: CashMovementSchema,
  CashMovementCreate: CashMovementCreateSchema,
  CashClosing: CashClosingSchema,
  CashClosingCreate: CashClosingCreateSchema,
  CashClosingVerify: CashClosingVerifySchema,
  User: UserSchema,
  UserCreate: UserCreateSchema,
  UserUpdate: UserUpdateSchema,
  UserLogin: UserLoginSchema,
  AuditLog: AuditLogSchema,
  InventoryAlert: InventoryAlertSchema,
  Pagination: PaginationSchema,
  ProductFilter: ProductFilterSchema,
  SalesFilter: SalesFilterSchema,
  CustomerFilter: CustomerFilterSchema,
};
