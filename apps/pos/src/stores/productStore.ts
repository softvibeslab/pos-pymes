import { create } from 'zustand';
import type { Product } from '@pos-pymes/shared';

interface ProductStore {
  products: Product[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchProducts: () => Promise<void>;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  searchProducts: (query: string) => Product[];
  getProductByBarcode: (barcode: string) => Product | null;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  // Initial state
  products: [],
  loading: false,
  error: null,

  // Actions
  fetchProducts: async () => {
    set({ loading: true, error: null });

    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/products');

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();

      if (data.success) {
        set({ products: data.data, loading: false });
      } else {
        throw new Error(data.error?.message || 'Failed to fetch products');
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An error occurred',
        loading: false,
      });
    }
  },

  addProduct: (product) => {
    set((state) => ({ products: [...state.products, product] }));
  },

  updateProduct: (id, updatedProduct) => {
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, ...updatedProduct } : p
      ),
    }));
  },

  deleteProduct: (id) => {
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    }));
  },

  searchProducts: (query) => {
    const { products } = get();
    const normalizedQuery = query.toLowerCase().trim();

    if (!normalizedQuery) return products;

    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(normalizedQuery) ||
        p.barcode.includes(normalizedQuery) ||
        p.brand?.toLowerCase().includes(normalizedQuery)
    );
  },

  getProductByBarcode: (barcode) => {
    const { products } = get();
    return products.find((p) => p.barcode === barcode) || null;
  },
}));
