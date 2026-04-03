'use client';

import { useState, useEffect, useRef } from 'react';
import { Barcode, Loader2 } from 'lucide-react';
import { useProductStore } from '@/stores/productStore';
import { useSaleStore } from '@/stores/saleStore';
import { useToast } from '@/hooks/useToast';

export function BarcodeScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [lastBarcode, setLastBarcode] = useState<string>('');
  const getProductByBarcode = useProductStore((state) => state.getProductByBarcode);
  const addItem = useSaleStore((state) => state.addItem);
  const toast = useToast();
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Listen for barcode scanner input
    // Barcode scanners typically act as keyboard input
    let barcodeBuffer = '';
    let barcodeTimeout: NodeJS.Timeout;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if the input is from a barcode scanner
      // Barcode scanners usually send input very fast
      clearTimeout(barcodeTimeout);

      // Accumulate characters
      barcodeBuffer += event.key;

      // Set a timeout to detect when the barcode is complete
      barcodeTimeout = setTimeout(() => {
        if (barcodeBuffer.length >= 8) { // Minimum barcode length
          handleBarcodeScanned(barcodeBuffer);
        }
        barcodeBuffer = '';
      }, 100); // 100ms without input means barcode is complete
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(barcodeTimeout);
    };
  }, []);

  const handleBarcodeScanned = async (barcode: string) => {
    // Prevent duplicate scans
    if (barcode === lastBarcode) return;

    setLastBarcode(barcode);
    setIsScanning(true);

    try {
      const product = getProductByBarcode(barcode);

      if (product) {
        if (product.stockCurrent > 0) {
          addItem(product, 1);
          toast.success(`Producto agregado: ${product.name}`);
        } else {
          toast.error('Producto sin stock');
        }
      } else {
        toast.error('Producto no encontrado');
      }
    } catch (error) {
      toast.error('Error al escanear producto');
    } finally {
      setIsScanning(false);

      // Clear last barcode after 2 seconds to allow same barcode to be scanned again
      timeoutRef.current = setTimeout(() => {
        setLastBarcode('');
      }, 2000);
    }
  };

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-gray-50 px-4 py-2">
      <Barcode className="h-5 w-5 text-gray-400" />
      <div className="flex-1">
        <p className="text-sm text-gray-600">
          Escanea un código de barras para agregar productos
        </p>
      </div>
      {isScanning && (
        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
      )}
    </div>
  );
}
