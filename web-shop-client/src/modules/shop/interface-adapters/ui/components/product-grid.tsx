'use client';

import { ProductCard } from './product-card';

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

interface ProductGridProps {
  products: Product[];
  onCardClick: (product: Product) => void;
  onBuyClick: (productId: string) => void;
}

export function ProductGrid({ products, onCardClick, onBuyClick }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onCardClick={onCardClick}
          onBuyClick={onBuyClick}
        />
      ))}
    </div>
  );
}
