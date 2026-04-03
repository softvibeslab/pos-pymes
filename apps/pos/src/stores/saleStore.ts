import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SaleItem, Product } from '@pos-pymes/shared';

interface SaleStore {
  // State
  items: SaleItem[];
  customerId?: string;
  discount: number;
  paymentMethod: 'cash' | 'card' | 'credit' | null;

  // Actions
  addItem: (product: Product, quantity: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  setCustomer: (customerId: string) => void;
  setDiscount: (discount: number) => void;
  setPaymentMethod: (method: 'cash' | 'card' | 'credit') => void;
  completeSale: () => void;

  // Computed
  subtotal: number;
  tax: number;
  total: number;
}

export const useSaleStore = create<SaleStore>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      customerId: undefined,
      discount: 0,
      paymentMethod: null,

      // Computed values
      get subtotal() {
        return get().items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      },
      get tax() {
        return 0; // TODO: Implement tax calculation
      },
      get total() {
        const { subtotal, tax, discount } = get();
        return Math.max(0, subtotal + tax - discount);
      },

      // Actions
      addItem: (product, quantity) => {
        const { items } = get();

        // Check if product already exists in cart
        const existingItemIndex = items.findIndex(
          (item) => item.productId === product.id
        );

        if (existingItemIndex !== -1) {
          // Update quantity of existing item
          const updatedItems = [...items];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + quantity,
            subtotal: (updatedItems[existingItemIndex].quantity + quantity) * product.salePrice,
          };
          set({ items: updatedItems });
        } else {
          // Add new item to cart
          const newItem: SaleItem = {
            id: crypto.randomUUID(),
            productId: product.id,
            productName: product.name,
            quantity,
            unitPrice: product.salePrice,
            subtotal: quantity * product.salePrice,
            costPrice: product.costPrice,
            createdAt: new Date(),
          };
          set({ items: [...items, newItem] });
        }
      },

      removeItem: (itemId) => {
        const { items } = get();
        set({ items: items.filter((item) => item.id !== itemId) });
      },

      updateQuantity: (itemId, quantity) => {
        const { items } = get();

        if (quantity <= 0) {
          // Remove item if quantity is 0 or negative
          get().removeItem(itemId);
          return;
        }

        const updatedItems = items.map((item) =>
          item.id === itemId
            ? { ...item, quantity, subtotal: quantity * item.unitPrice }
            : item
        );
        set({ items: updatedItems });
      },

      clearCart: () => {
        set({
          items: [],
          customerId: undefined,
          discount: 0,
          paymentMethod: null,
        });
      },

      setCustomer: (customerId) => {
        set({ customerId });
      },

      setDiscount: (discount) => {
        set({ discount: Math.max(0, discount) });
      },

      setPaymentMethod: (paymentMethod) => {
        set({ paymentMethod });
      },

      completeSale: () => {
        // This would typically send the sale to the API
        const { items, subtotal, tax, discount, total, paymentMethod, customerId } = get();

        if (items.length === 0) {
          throw new Error('Cart is empty');
        }

        if (!paymentMethod) {
          throw new Error('Payment method not selected');
        }

        // Create sale object
        const sale = {
          id: crypto.randomUUID(),
          items,
          subtotal,
          tax,
          discount,
          total,
          paymentMethod,
          customerId,
          createdAt: new Date(),
        };

        // Clear cart after successful sale
        get().clearCart();

        return sale;
      },
    }),
    {
      name: 'pos-sale-storage',
      partialize: (state) => ({
        items: state.items,
        customerId: state.customerId,
        discount: state.discount,
      }),
    }
  )
);
