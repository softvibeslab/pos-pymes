// UUID Generator
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Currency Formatter
export function formatCurrency(amount: number, locale: string = 'es-MX', currency: string = 'USD'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Number Formatter
export function formatNumber(
  value: number,
  decimals: number = 2,
  locale: string = 'es-MX'
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

// Percentage Formatter
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

// Date Formatter
export function formatDate(date: Date | string, format: 'short' | 'long' | 'time' = 'short', locale: string = 'es-MX'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  switch (format) {
    case 'short':
      return new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(dateObj);
    case 'long':
      return new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(dateObj);
    case 'time':
      return new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(dateObj);
    default:
      return dateObj.toLocaleDateString(locale);
  }
}

// Calculate Change
export function calculateChange(total: number, paid: number): number {
  return paid - total;
}

// Calculate Subtotal
export function calculateSubtotal(quantity: number, unitPrice: number): number {
  return quantity * unitPrice;
}

// Calculate Total
export function calculateTotal(
  items: Array<{ quantity: number; unitPrice: number }>,
  discount: number = 0,
  taxRate: number = 0
): { subtotal: number; tax: number; discount: number; total: number } {
  const subtotal = items.reduce((sum, item) => sum + calculateSubtotal(item.quantity, item.unitPrice), 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax - discount;

  return { subtotal, tax, discount, total };
}

// Calculate Profit
export function calculateProfit(
  salePrice: number,
  costPrice: number | undefined,
  quantity: number = 1
): number {
  if (costPrice === undefined) return 0;
  return (salePrice - costPrice) * quantity;
}

// Calculate Profit Margin
export function calculateProfitMargin(salePrice: number, costPrice: number | undefined): number {
  if (costPrice === undefined || salePrice === 0) return 0;
  return ((salePrice - costPrice) / salePrice) * 100;
}

// Check if stock is low
export function isLowStock(current: number, min: number): boolean {
  return current <= min;
}

// Generate Ticket Number
export function generateTicketNumber(storeId: string, date: Date = new Date()): string {
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');

  return `T${storeId.slice(-4)}${year}${month}${day}${random}`;
}

// Validate PIN
export function validatePIN(pin: string, hash: string): boolean {
  // In production, use bcrypt or similar
  // This is a simplified version for demo
  return pin === hash;
}

// Hash PIN
export function hashPIN(pin: string): string {
  // In production, use bcrypt or similar
  // This is a simplified version for demo
  return pin; // TODO: Implement proper hashing
}

// Sanitize string input
export function sanitizeString(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

// Deep clone object
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Sleep function
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Retry function
export async function retry<T>(
  func: () => Promise<T>,
  options: { attempts?: number; delay?: number; backoff?: number } = {}
): Promise<T> {
  const { attempts = 3, delay = 1000, backoff = 2 } = options;
  let lastError: Error | undefined;

  for (let i = 0; i < attempts; i++) {
    try {
      return await func();
    } catch (error) {
      lastError = error as Error;
      if (i < attempts - 1) {
        await sleep(delay * Math.pow(backoff, i));
      }
    }
  }

  throw lastError;
}

// Parse barcode
export function parseBarcode(code: string): { type: string; value: string } | null {
  // EAN-13
  if (/^\d{13}$/.test(code)) {
    return { type: 'EAN13', value: code };
  }

  // EAN-8
  if (/^\d{8}$/.test(code)) {
    return { type: 'EAN8', value: code };
  }

  // UPC-A
  if (/^\d{12}$/.test(code)) {
    return { type: 'UPCA', value: code };
  }

  // Code 128
  if (/^[A-Z0-9]{1,48}$/i.test(code)) {
    return { type: 'CODE128', value: code };
  }

  // Code 39
  if (/^[0-9A-Z\-\.\ \$\/\+\%]+$/.test(code)) {
    return { type: 'CODE39', value: code };
  }

  return null;
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone number
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?\d{10,15}$/;
  return phoneRegex.test(phone);
}

// Format phone number
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  return phone;
}

// Calculate age
export function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

// Check if date is today
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

// Get start of day
export function startOfDay(date: Date = new Date()): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

// Get end of day
export function endOfDay(date: Date = new Date()): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

// Get start of month
export function startOfMonth(date: Date = new Date()): Date {
  const result = new Date(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
}

// Get end of month
export function endOfMonth(date: Date = new Date()): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1);
  result.setDate(0);
  result.setHours(23, 59, 59, 999);
  return result;
}

// Date range intersection
export function dateRangesIntersect(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 <= end2 && start2 <= end1;
}

// Clamp number between min and max
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Round to decimal places
export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

// Generate random color
export function generateRandomColor(): string {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
}

// Convert hex to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Get contrast color (black or white based on background)
export function getContrastColor(hexColor: string): string {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return '#000000';

  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#ffffff';
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Download file
export function downloadFile(data: Blob, filename: string): void {
  const url = window.URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      textArea.remove();
      return true;
    } catch (error) {
      textArea.remove();
      return false;
    }
  } catch {
    return false;
  }
}

// Check if online
export function isOnline(): boolean {
  return typeof window !== 'undefined' && navigator.onLine;
}

// Get network information
export function getNetworkInfo(): {
  online: boolean;
  type?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
} {
  if (typeof window === 'undefined' || !('connection' in navigator)) {
    return { online: isOnline() };
  }

  const connection = (navigator as any).connection;
  return {
    online: navigator.onLine,
    type: connection?.type,
    effectiveType: connection?.effectiveType,
    downlink: connection?.downlink,
    rtt: connection?.rtt,
  };
}

// Local storage helpers
export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    if (typeof window === 'undefined') return defaultValue ?? null;

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue ?? null;
    } catch {
      return defaultValue ?? null;
    }
  },

  set: <T>(key: string, value: T): boolean => {
    if (typeof window === 'undefined') return false;

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  remove: (key: string): boolean => {
    if (typeof window === 'undefined') return false;

    try {
      window.localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },

  clear: (): boolean => {
    if (typeof window === 'undefined') return false;

    try {
      window.localStorage.clear();
      return true;
    } catch {
      return false;
    }
  },
};

// Session storage helpers
export const sessionStorage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    if (typeof window === 'undefined') return defaultValue ?? null;

    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue ?? null;
    } catch {
      return defaultValue ?? null;
    }
  },

  set: <T>(key: string, value: T): boolean => {
    if (typeof window === 'undefined') return false;

    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  remove: (key: string): boolean => {
    if (typeof window === 'undefined') return false;

    try {
      window.sessionStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },

  clear: (): boolean => {
    if (typeof window === 'undefined') return false;

    try {
      window.sessionStorage.clear();
      return true;
    } catch {
      return false;
    }
  },
};

// Error handler
export function handleError(error: unknown): { message: string; code?: string } {
  if (error instanceof Error) {
    return {
      message: error.message,
      code: (error as any).code,
    };
  }

  if (typeof error === 'string') {
    return { message: error };
  }

  return { message: 'An unknown error occurred' };
}

// Logger
export const logger = {
  debug: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[DEBUG]', ...args);
    }
  },
  info: (...args: any[]) => {
    console.info('[INFO]', ...args);
  },
  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args);
  },
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
  },
};

// Array helpers
export const arrayHelpers = {
  unique: <T>(arr: T[]): T[] => [...new Set(arr)],
  chunk: <T>(arr: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  },
  groupBy: <T, K extends keyof any>(arr: T[], key: (item: T) => K): Record<K, T[]> => {
    return arr.reduce((result, item) => {
      const group = key(item);
      if (!result[group]) {
        result[group] = [];
      }
      result[group].push(item);
      return result;
    }, {} as Record<K, T[]>);
  },
  sortBy: <T>(arr: T[], key: keyof T | ((item: T) => any), order: 'asc' | 'desc' = 'asc'): T[] => {
    return [...arr].sort((a, b) => {
      const aVal = typeof key === 'function' ? key(a) : a[key];
      const bVal = typeof key === 'function' ? key(b) : b[key];

      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  },
};

// Object helpers
export const objectHelpers = {
  omit: <T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
    const result = { ...obj };
    keys.forEach((key) => delete result[key]);
    return result;
  },
  pick: <T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
    return keys.reduce((result, key) => {
      if (key in obj) {
        result[key] = obj[key];
      }
      return result;
    }, {} as Pick<T, K>);
  },
  merge: <T extends Record<string, any>>(...objs: Partial<T>[]): T => {
    return objs.reduce((result, obj) => ({ ...result, ...obj }), {} as T);
  },
};
