import { SaleGrid } from '@/components/SaleGrid';
import { SaleCart } from '@/components/SaleCart';
import { SaleTotal } from '@/components/SaleTotal';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import { SearchBar } from '@/components/SearchBar';
import { QuickActions } from '@/components/QuickActions';
import { useSaleStore } from '@/stores/saleStore';

export default function HomePage() {
  const { items, total } = useSaleStore();

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">POS PyMES</h1>
            <p className="text-sm text-gray-500">Sistema de Punto de Venta</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Cajero: Admin</p>
              <p className="text-xs text-gray-500">{new Date().toLocaleDateString('es-MX')}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side - Product Grid */}
        <div className="flex flex-1 flex-col border-r">
          {/* Search and Scanner */}
          <div className="border-b bg-white p-4">
            <SearchBar />
            <BarcodeScanner />
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-auto p-4 scrollbar-thin">
            <SaleGrid />
          </div>
        </div>

        {/* Right Side - Cart */}
        <div className="flex w-96 flex-col border-l bg-white shadow-lg">
          {/* Cart Header */}
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Carrito ({items.length} productos)
            </h2>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-auto p-4 scrollbar-thin">
            <SaleCart />
          </div>

          {/* Total and Actions */}
          <div className="border-t p-4">
            <SaleTotal total={total} />
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
}
