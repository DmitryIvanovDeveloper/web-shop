'use client';

import { useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  imageUrl: string;
  category: string;
  inStock: boolean;
  discount?: number;
  icon?: string;
  categoryLabel?: string;
  rp?: number;
  lp?: number;
}

interface ProductPopupProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onBuyClick: (productId: string) => void;
}

export function ProductPopup({ product, isOpen, onClose, onBuyClick }: ProductPopupProps) {
  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Popup - размером как карточка */}
      <div className="relative bg-gray-800 border border-gray-600 rounded-lg shadow-2xl w-80 max-h-[80vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl font-bold transition-colors z-10 bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center"
        >
          ×
        </button>

        {/* Product Image */}
        <div className="h-48 bg-gray-700 flex items-center justify-center">
          <div className="text-6xl">{product.icon || '⚔️'}</div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="text-lg font-bold text-white mb-2">{product.name}</h3>
          <p className="text-gray-400 text-sm mb-3">{product.description}</p>
          
          {/* Category */}
          <div className="mb-3">
            <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
              {product.categoryLabel || product.category}
            </span>
          </div>

          {/* Price */}
          <div className="mb-4">
            {product.originalPrice && (
              <span className="text-gray-400 line-through text-sm mr-2">
                {product.originalPrice}
              </span>
            )}
            <span className="text-white font-bold text-xl">
              {product.price}
            </span>
            {product.discount && (
              <span className="text-green-400 text-xs ml-2">
                -{product.discount}%
              </span>
            )}
          </div>

          {/* Points */}
          {(product.rp || product.lp) && (
            <div className="flex gap-4 mb-4 text-sm">
              {product.rp && <span className="text-yellow-400">RP +{product.rp}</span>}
              {product.lp && <span className="text-blue-400">LP +{product.lp}</span>}
            </div>
          )}

          {/* Stock Status */}
          <div className="mb-4">
            <span className={`text-sm font-medium ${product.inStock ? 'text-green-400' : 'text-red-400'}`}>
              {product.inStock ? '✓ В наличии' : '✗ Нет в наличии'}
            </span>
          </div>

          {/* Buy Button */}
          <button
            onClick={() => {
              onBuyClick(product.id);
              onClose();
            }}
            disabled={!product.inStock}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded transition-colors"
          >
            {product.inStock ? 'КУПИТЬ' : 'НЕТ В НАЛИЧИИ'}
          </button>
        </div>
      </div>
    </div>
  );
}
