'use client';

interface SaleTotalProps {
  total: number;
}

export function SaleTotal({ total }: SaleTotalProps) {
  return (
    <div className="space-y-3">
      {/* Subtotal */}
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Subtotal:</span>
        <span className="font-medium text-gray-900">${total.toFixed(2)}</span>
      </div>

      {/* Tax (if applicable) */}
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">IVA:</span>
        <span className="font-medium text-gray-900">$0.00</span>
      </div>

      {/* Total */}
      <div className="flex justify-between border-t pt-3">
        <span className="text-lg font-bold text-gray-900">Total:</span>
        <span className="text-2xl font-bold text-blue-600">${total.toFixed(2)}</span>
      </div>
    </div>
  );
}
