'use client';

import { useSaleStore } from '@/stores/saleStore';
import { DollarSign, CreditCard, Users, Printer } from 'lucide-react';
import { useState } from 'react';
import { PaymentModal } from './PaymentModal';
import { useToast } from '@/hooks/useToast';

export function QuickActions() {
  const { items, total, paymentMethod, setPaymentMethod, completeSale } = useSaleStore();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const toast = useToast();

  const handlePaymentMethod = (method: 'cash' | 'card' | 'credit') => {
    if (items.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    setPaymentMethod(method);
    setShowPaymentModal(true);
  };

  const isCartEmpty = items.length === 0;

  return (
    <div className="space-y-3">
      {/* Payment Method Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => handlePaymentMethod('cash')}
          disabled={isCartEmpty}
          className="flex flex-col items-center gap-1 rounded-lg border-2 border-green-500 bg-green-50 p-3 transition-colors hover:bg-green-100 disabled:opacity-50 disabled:hover:bg-green-50"
        >
          <DollarSign className="h-6 w-6 text-green-600" />
          <span className="text-xs font-medium text-green-700">Efectivo</span>
        </button>

        <button
          onClick={() => handlePaymentMethod('card')}
          disabled={isCartEmpty}
          className="flex flex-col items-center gap-1 rounded-lg border-2 border-blue-500 bg-blue-50 p-3 transition-colors hover:bg-blue-100 disabled:opacity-50 disabled:hover:bg-blue-50"
        >
          <CreditCard className="h-6 w-6 text-blue-600" />
          <span className="text-xs font-medium text-blue-700">Tarjeta</span>
        </button>

        <button
          onClick={() => handlePaymentMethod('credit')}
          disabled={isCartEmpty}
          className="flex flex-col items-center gap-1 rounded-lg border-2 border-purple-500 bg-purple-50 p-3 transition-colors hover:bg-purple-100 disabled:opacity-50 disabled:hover:bg-purple-50"
        >
          <Users className="h-6 w-6 text-purple-600" />
          <span className="text-xs font-medium text-purple-700">Fiado</span>
        </button>
      </div>

      {/* Complete Sale Button */}
      <button
        onClick={() => handlePaymentMethod('cash')}
        disabled={isCartEmpty}
        className="w-full rounded-lg bg-blue-600 py-3 text-lg font-bold text-white transition-colors hover:bg-blue-700 disabled:bg-gray-300 disabled:hover:bg-gray-300"
      >
        Cobrar (${total.toFixed(2)})
      </button>

      {/* Print Receipt Button */}
      <button
        disabled={isCartEmpty}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
      >
        <Printer className="h-4 w-4" />
        Imprimir Ticket
      </button>

      {/* Payment Modal */}
      {showPaymentModal && paymentMethod && (
        <PaymentModal
          paymentMethod={paymentMethod}
          total={total}
          onClose={() => setShowPaymentModal(false)}
          onComplete={completeSale}
        />
      )}
    </div>
  );
}
