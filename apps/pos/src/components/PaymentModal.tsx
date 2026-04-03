'use client';

import { useEffect, useState, useRef } from 'react';
import { X, DollarSign, CreditCard, Users, Loader2 } from 'lucide-react';
import type { PaymentMethod } from '@pos-pymes/shared';

interface PaymentModalProps {
  paymentMethod: PaymentMethod;
  total: number;
  onClose: () => void;
  onComplete: () => void;
}

export function PaymentModal({ paymentMethod, total, onClose, onComplete }: PaymentModalProps) {
  const [paid, setPaid] = useState('');
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const change = paid ? parseFloat(paid) - total : 0;

  const handlePayment = async () => {
    setProcessing(true);

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Complete the sale
      onComplete();

      // Close modal
      onClose();
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleQuickAmount = (amount: number) => {
    setPaid(amount.toString());
  };

  const paymentMethodConfig = {
    cash: {
      icon: DollarSign,
      title: 'Pago en Efectivo',
      color: 'green',
    },
    card: {
      icon: CreditCard,
      title: 'Pago con Tarjeta',
      color: 'blue',
    },
    credit: {
      icon: Users,
      title: 'Pago a Crédito',
      color: 'purple',
    },
  };

  const config = paymentMethodConfig[paymentMethod];
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className={`flex items-center justify-between border-b bg-${config.color}-50 px-6 py-4`}>
          <div className="flex items-center gap-2">
            <Icon className={`h-6 w-6 text-${config.color}-600`} />
            <h2 className="text-lg font-semibold text-gray-900">{config.title}</h2>
          </div>
          <button
            onClick={onClose}
            disabled={processing}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 p-6">
          {/* Total */}
          <div className="text-center">
            <p className="text-sm text-gray-600">Total a pagar</p>
            <p className="text-4xl font-bold text-gray-900">${total.toFixed(2)}</p>
          </div>

          {/* Cash Payment Input */}
          {paymentMethod === 'cash' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="paid" className="mb-2 block text-sm font-medium text-gray-700">
                  Efectivo recibido
                </label>
                <input
                  ref={inputRef}
                  id="paid"
                  type="number"
                  step="0.01"
                  value={paid}
                  onChange={(e) => setPaid(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-2xl text-center focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="0.00"
                  disabled={processing}
                />
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => handleQuickAmount(Math.ceil(total / 10) * 10)}
                  disabled={processing}
                  className="rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  ${(Math.ceil(total / 10) * 10).toFixed(0)}
                </button>
                <button
                  onClick={() => handleQuickAmount(Math.ceil(total / 20) * 20)}
                  disabled={processing}
                  className="rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  ${(Math.ceil(total / 20) * 20).toFixed(0)}
                </button>
                <button
                  onClick={() => handleQuickAmount(Math.ceil(total / 50) * 50)}
                  disabled={processing}
                  className="rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  ${(Math.ceil(total / 50) * 50).toFixed(0)}
                </button>
                <button
                  onClick={() => handleQuickAmount(Math.ceil(total / 100) * 100)}
                  disabled={processing}
                  className="rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  ${(Math.ceil(total / 100) * 100).toFixed(0)}
                </button>
              </div>

              {/* Change Display */}
              {paid && (
                <div className="rounded-lg bg-green-50 p-4 text-center">
                  <p className="text-sm text-green-700">Cambio</p>
                  <p className={`text-3xl font-bold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${Math.abs(change).toFixed(2)}
                  </p>
                  {change < 0 && (
                    <p className="text-xs text-red-600">Faltan ${Math.abs(change).toFixed(2)}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Card Payment */}
          {paymentMethod === 'card' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
                <CreditCard className="mx-auto h-12 w-12 text-blue-500" />
                <p className="mt-2 text-sm text-blue-700">
                  Procesando pago con tarjeta...
                </p>
              </div>
              <p className="text-center text-sm text-gray-500">
                Por favor, use la terminal de pago
              </p>
            </div>
          )}

          {/* Credit Payment */}
          {paymentMethod === 'credit' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 text-center">
                <Users className="mx-auto h-12 w-12 text-purple-500" />
                <p className="mt-2 text-sm text-purple-700">
                  Se registrará el pago a crédito
                </p>
              </div>
              <p className="text-center text-sm text-gray-500">
                El cliente deberá seleccionarse antes de completar la venta
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 border-t bg-gray-50 px-6 py-4">
          <button
            onClick={onClose}
            disabled={processing}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handlePayment}
            disabled={processing || (paymentMethod === 'cash' && (!paid || change < 0))}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-300 disabled:hover:bg-gray-300"
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              'Completar Venta'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
