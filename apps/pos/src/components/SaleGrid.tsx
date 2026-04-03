'use client';

import { useProductStore } from '@/stores/productStore';
import { useSaleStore } from '@/stores/saleStore';
import { useState } from 'react';
import type { Product } from '@pos-pymes/shared';
import { Loader2, Package } from 'lucide-react';

export function SaleGrid() {
  const { products, loading, error } = useProductStore();
  const addItem = useSaleStore((state) => state.addItem);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter products by category
  const filteredProducts = selectedCategory
    ? products.filter((p) => p.categoryId === selectedCategory)
    : products;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-500" />
          <p className="mt-4 text-sm text-gray-500">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-4 text-sm text-gray-500">Error al cargar productos</p>
          <p className="text-xs text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-sm text-gray-500">No hay productos disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            selectedCategory === null
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Todos
        </button>
        {/* TODO: Add category buttons */}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      addItem(product, 1);
    } finally {
      setLoading(false);
    }
  };

  const isLowStock = product.stockCurrent <= product.stockMin;

  return (
    <button
      onClick={handleClick}
      disabled={loading || product.stockCurrent === 0}
      className={`
        relative flex flex-col items-center justify-center rounded-lg border-2 p-4
        transition-all hover:scale-105 active:scale-95
        ${
          product.stockCurrent === 0
            ? 'border-gray-200 bg-gray-100 opacity-50'
            : 'border-blue-200 bg-white hover:border-blue-500 hover:shadow-md'
        }
      `}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/80">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        </div>
      )}

      {/* Product Image or Icon */}
      <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <Package className="h-8 w-8 text-blue-500" />
        )}
      </div>

      {/* Product Name */}
      <h3 className="mb-1 text-center text-sm font-medium text-gray-900 line-clamp-2">
        {product.name}
      </h3>

      {/* Price */}
      <p className="text-lg font-bold text-blue-600">
        ${product.salePrice.toFixed(2)}
      </p>

      {/* Stock */}
      <p
        className={`text-xs ${
          isLowStock ? 'text-red-500 font-medium' : 'text-gray-500'
        }`}
      >
        Stock: {product.stockCurrent}
      </p>

      {/* Low Stock Alert */}
      {isLowStock && product.stockCurrent > 0 && (
        <span className="absolute right-2 top-2 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
        </span>
      )}

      {/* Out of Stock */}
      {product.stockCurrent === 0 && (
        <span className="absolute right-2 top-2 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
          AGOTADO
        </span>
      )}
    </button>
  );
}
