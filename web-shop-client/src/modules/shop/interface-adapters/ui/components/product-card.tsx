'use client';

interface ProductCardProps {
  product: {
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
  };
  onCardClick: (product: ProductCardProps['product']) => void;
  onBuyClick: (productId: string) => void;
}

export function ProductCard({ product, onCardClick, onBuyClick }: ProductCardProps) {
  return (
    <div 
      className="bg-gray-800 border border-gray-600 rounded-lg overflow-hidden shadow-lg cursor-pointer hover:shadow-xl hover:border-blue-500 transition-all duration-200"
      onClick={() => onCardClick(product)}
    >
      {/* Product Image */}
      <div className="h-48 bg-gray-700 flex items-center justify-center">
        <div className="text-6xl">{product.icon || '⚔️'}</div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-white mb-2">{product.name}</h3>
        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{product.description}</p>
        
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
        </div>

        {/* Points */}
        {(product.rp || product.lp) && (
          <div className="flex gap-4 mb-4 text-sm">
            {product.rp && <span className="text-yellow-400">RP +{product.rp}</span>}
            {product.lp && <span className="text-blue-400">LP +{product.lp}</span>}
          </div>
        )}

        {/* Buy Button */}
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
          disabled={!product.inStock}
          onClick={(e) => {
            e.stopPropagation();
            onBuyClick(product.id);
          }}
        >
          {product.inStock ? 'КУПИТЬ' : 'НЕТ В НАЛИЧИИ'}
        </button>
      </div>
    </div>
  );
}
