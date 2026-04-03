'use client';

import { useSaleStore } from '@/stores/saleStore';
import { Minus, Plus, Trash2, Package } from 'lucide-react';

export function SaleCart() {
  const { items, removeItem, updateQuantity } = useSaleStore();

  if (items.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-sm text-gray-500">Carrito vacío</p>
          <p className="text-xs text-gray-400">
            Escanea o selecciona productos para agregar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <CartItem
          key={item.id}
          item={item}
          onRemove={() => removeItem(item.id)}
          onUpdateQuantity={(quantity) => updateQuantity(item.id, quantity)}
        />
      ))}
    </div>
  );
}

interface CartItemProps {
  item: {
    id: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  };
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
}

function CartItem({ item, onRemove, onUpdateQuantity }: CartItemProps) {
  const handleQuantityChange = (delta: number) => {
    const newQuantity = item.quantity + delta;
    onUpdateQuantity(newQuantity);
  };

  return (
    <div className="rounded-lg border bg-white p-3 shadow-sm transition-shadow hover:shadow">
      {/* Product Name */}
      <h4 className="mb-2 text-sm font-medium text-gray-900 line-clamp-2">
        {item.productName}
      </h4>

      {/* Quantity and Price */}
      <div className="flex items-center justify-between">
        {/* Quantity Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleQuantityChange(-1)}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 disabled:opacity-50"
            disabled={item.quantity <= 1}
          >
            <Minus className="h-3 w-3" />
          </button>

          <span className="w-8 text-center text-sm font-medium text-gray-900">
            {item.quantity}
          </span>

          <button
            onClick={() => handleQuantityChange(1)}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-colors hover:bg-blue-200"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>

        {/* Price */}
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">
            ${item.unitPrice.toFixed(2)} c/u
          </p>
          <p className="text-sm font-bold text-blue-600">
            ${item.subtotal.toFixed(2)}
          </p>
        </div>

        {/* Remove Button */}
        <button
          onClick={onRemove}
          className="ml-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-red-600 transition-colors hover:bg-red-200"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
