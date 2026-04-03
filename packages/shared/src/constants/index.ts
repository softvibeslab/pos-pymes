// API Constants
export const API_ROUTES = {
  // Sales
  SALES: '/api/sales',
  SALE_BY_ID: (id: string) => `/api/sales/${id}`,
  SALE_ITEMS: (id: string) => `/api/sales/${id}/items`,
  SALE_ITEM_BY_ID: (saleId: string, itemId: string) => `/api/sales/${saleId}/items/${itemId}`,
  SALE_COMPLETE: (id: string) => `/api/sales/${id}/complete`,
  SALE_REFUND: (id: string) => `/api/sales/${id}/refund`,

  // Products
  PRODUCTS: '/api/products',
  PRODUCT_BY_ID: (id: string) => `/api/products/${id}`,
  PRODUCT_BY_BARCODE: (code: string) => `/api/products/barcode/${code}`,
  PRODUCT_SYNC: '/api/products/sync',

  // Customers
  CUSTOMERS: '/api/customers',
  CUSTOMER_BY_ID: (id: string) => `/api/customers/${id}`,
  CUSTOMER_CREDITS: (id: string) => `/api/customers/${id}/credits`,

  // Credits
  CREDITS: '/api/credits',
  CREDIT_PAY: (id: string) => `/api/credits/${id}/pay`,

  // Cash
  CASH_OPEN: '/api/cash/open',
  CASH_MOVEMENTS: '/api/cash/movements',
  CASH_CLOSE: '/api/cash/close',
  CASH_VERIFY: '/api/cash/verify',
  CASH_REPORT: (date: string) => `/api/cash/report/${date}`,

  // Dashboard
  DASHBOARD_SUMMARY: '/api/dashboard/summary',
  DASHBOARD_SALES: '/api/dashboard/sales',
  DASHBOARD_PROFITS: '/api/dashboard/profits',
  DASHBOARD_INVENTORY: '/api/dashboard/inventory',
  DASHBOARD_CREDITS: '/api/dashboard/credits',

  // Sync
  SYNC_PUSH: '/api/sync/push',
  SYNC_PULL: '/api/sync/pull',
  SYNC_RESOLVE: '/api/sync/resolve',
} as const;

// User Roles
export const USER_ROLES = {
  OWNER: 'owner',
  MANAGER: 'manager',
  CASHIER: 'cashier',
} as const;

// Permissions
export const PERMISSIONS = {
  SALES_CREATE: 'sales:create',
  SALES_CANCEL: 'sales:cancel',
  SALES_REFUND: 'sales:refund',
  PRODUCTS_CREATE: 'products:create',
  PRODUCTS_EDIT: 'products:edit',
  PRODUCTS_DELETE: 'products:delete',
  INVENTORY_ADJUST: 'inventory:adjust',
  CASH_OPEN: 'cash:open',
  CASH_CLOSE: 'cash:close',
  CASH_MOVEMENTS: 'cash:movements',
  CUSTOMERS_CREATE: 'customers:create',
  CUSTOMERS_EDIT: 'customers:edit',
  CUSTOMERS_DELETE: 'customers:delete',
  CREDITS_CREATE: 'credits:create',
  CREDITS_COLLECT: 'credits:collect',
  REPORTS_VIEW: 'reports:view',
  USERS_MANAGE: 'users:manage',
  SETTINGS_MANAGE: 'settings:manage',
} as const;

// Role Permissions Mapping
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  owner: Object.values(PERMISSIONS),
  manager: [
    PERMISSIONS.SALES_CREATE,
    PERMISSIONS.SALES_CANCEL,
    PERMISSIONS.SALES_REFUND,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_EDIT,
    PERMISSIONS.INVENTORY_ADJUST,
    PERMISSIONS.CASH_OPEN,
    PERMISSIONS.CASH_CLOSE,
    PERMISSIONS.CASH_MOVEMENTS,
    PERMISSIONS.CUSTOMERS_CREATE,
    PERMISSIONS.CUSTOMERS_EDIT,
    PERMISSIONS.CREDITS_CREATE,
    PERMISSIONS.CREDITS_COLLECT,
    PERMISSIONS.REPORTS_VIEW,
  ],
  cashier: [
    PERMISSIONS.SALES_CREATE,
    PERMISSIONS.CASH_OPEN,
    PERMISSIONS.CASH_MOVEMENTS,
    PERMISSIONS.CUSTOMERS_CREATE,
    PERMISSIONS.CREDITS_CREATE,
  ],
};

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  CREDIT: 'credit',
} as const;

// Sale Status
export const SALE_STATUS = {
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

// Credit Status
export const CREDIT_STATUS = {
  PENDING: 'pending',
  PARTIAL: 'partial',
  PAID: 'paid',
  OVERDUE: 'overdue',
} as const;

// Unit Types
export const UNIT_TYPES = {
  PIECE: 'piece',
  WEIGHT: 'weight',
  BULK: 'bulk',
} as const;

// Cash Movement Types
export const CASH_MOVEMENT_TYPES = {
  OPENING: 'opening',
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  CLOSING: 'closing',
} as const;

// Cash Closing Status
export const CASH_CLOSING_STATUS = {
  BLIND: 'blind',
  VERIFIED: 'verified',
} as const;

// Alert Types
export const ALERT_TYPES = {
  LOW_STOCK: 'low_stock',
  EXPIRING_SOON: 'expiring_soon',
  EXPIRED: 'expired',
} as const;

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm',
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  API: 'YYYY-MM-DD',
} as const;

// Currency
export const CURRENCY = {
  CODE: 'USD',
  SYMBOL: '$',
  DECIMAL_PLACES: 2,
} as const;

// Error Codes
export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  INSUFFICIENT_CREDIT: 'INSUFFICIENT_CREDIT',
  CASH_ALREADY_OPEN: 'CASH_ALREADY_OPEN',
  CASH_NOT_OPEN: 'CASH_NOT_OPEN',
  SYNC_CONFLICT: 'SYNC_CONFLICT',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

// Sync Constants
export const SYNC = {
  BATCH_SIZE: 100,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  CONFLICT_RESOLUTION: 'local' as 'local' | 'remote' | 'manual',
} as const;

// IndexedDB Constants
export const IDB = {
  DB_NAME: 'pos-pymes-db',
  DB_VERSION: 1,
  STORES: {
    PRODUCTS: 'products',
    SALES: 'sales',
    SALE_ITEMS: 'sale_items',
    CUSTOMERS: 'customers',
    CREDITS: 'credits',
    CASH_MOVEMENTS: 'cash_movements',
    CASH_CLOSINGS: 'cash_closings',
    USERS: 'users',
    AUDIT_LOGS: 'audit_logs',
    INVENTORY_ALERTS: 'inventory_alerts',
    SYNC_QUEUE: 'sync_queue',
  },
} as const;

// Hardware Constants
export const HARDWARE = {
  BARCODE_SCANNER: {
    VENDOR_IDS: [0x05E0, 0x045E, 0x04B4, 0x046D, 0x04D8],
    PRODUCT_IDS: [0x1200, 0x0824, 0x0835],
  },
  SCALE: {
    BAUD_RATES: [1200, 2400, 4800, 9600],
    DATA_BITS: 7,
    STOP_BITS: [1, 2],
    PARITY: 'none' as 'none' | 'even' | 'odd',
  },
  PRINTER: {
    COLUMNS: 32,
    ENCODING: 'UTF-8',
  },
} as const;

// PWA Constants
export const PWA = {
  CACHE_NAME: 'pos-pymes-v1',
  OFFLINE_URL: '/offline',
  STALE_TIME: 5 * 60 * 1000, // 5 minutes
} as const;

// Keyboard Shortcuts
export const KEYBOARD_SHORTCUTS = {
  FOCUS_SEARCH: 'Ctrl+K',
  NEW_SALE: 'Ctrl+N',
  COMPLETE_SALE: 'F4',
  CANCEL_SALE: 'Esc',
  REMOVE_ITEM: 'Delete',
  OPEN_CASH_DRAWER: 'F2',
  QUICK_CASH: 'F1',
  QUICK_CARD: 'F2',
  QUICK_CREDIT: 'F3',
} as const;
