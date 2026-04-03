'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useProductStore } from '@/stores/productStore';
import { useSaleStore } from '@/stores/saleStore';
import { useToast } from '@/hooks/useToast';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ id: string; name: string; barcode: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchProducts = useProductStore((state) => state.searchProducts);
  const addItem = useSaleStore((state) => state.addItem);
  const toast = useToast();

  useEffect(() => {
    if (query.length >= 2) {
      const results = searchProducts(query).slice(0, 5); // Limit to 5 suggestions
      setSuggestions(
        results.map((p) => ({
          id: p.id,
          name: p.name,
          barcode: p.barcode,
        }))
      );
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query, searchProducts]);

  const handleSelectProduct = (product: { id: string; name: string; barcode: string }) => {
    const products = searchProducts(query);
    const selectedProduct = products.find((p) => p.id === product.id);

    if (selectedProduct) {
      if (selectedProduct.stockCurrent > 0) {
        addItem(selectedProduct, 1);
        toast.success(`Producto agregado: ${selectedProduct.name}`);
        setQuery('');
        setShowSuggestions(false);
      } else {
        toast.error('Producto sin stock');
      }
    }
  };

  const handleClear = () => {
    setQuery('');
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre o código de barras..."
          className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          autoFocus
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border bg-white shadow-lg">
          {suggestions.map((product) => (
            <button
              key={product.id}
              onClick={() => handleSelectProduct(product)}
              className="flex w-full flex-col border-b px-4 py-2 text-left last:border-b-0 hover:bg-gray-50"
            >
              <span className="text-sm font-medium text-gray-900">{product.name}</span>
              <span className="text-xs text-gray-500">{product.barcode}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
