'use client';

import { useEffect, useState } from 'react';
import { container } from '../../../../infrastructure/bootstrap/container';
import { GetProductsUseCase } from '../../application/use-cases/get-products.use-case';
import { ProductListPresenter } from '../presenters/product-list.presenter';
import { ProductListViewModel, ProductViewModel } from '../view-models/product-list.view-model';
import { SHOP_TYPES } from '../../infrastructure/bootstrap/types';
import { 
  CategoryFilter, 
  ProductGrid, 
  LoadingState, 
  ErrorState, 
  ToastNotification,
  ProductPopup
} from './components';

interface ShopModuleProps {
  className?: string;
}

export function ShopModule({ className = '' }: ShopModuleProps) {
  const [viewModel, setViewModel] = useState<ProductListViewModel>({ status: 'idle', products: [] });
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showToast, setShowToast] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductViewModel | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const useCase = container.get<GetProductsUseCase>(SHOP_TYPES.GetProductsUseCase);
  const presenter = container.get<ProductListPresenter>(SHOP_TYPES.ProductListPresenter);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  async function loadProducts() {
    setViewModel(presenter.presentLoading());

    const result = await useCase.execute({
      category: selectedCategory || undefined
    });

    setViewModel(presenter.present(result));
  }

  function handleBuyClick(productId: string) {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }

  function handleCardClick(product: ProductViewModel) {
    setSelectedProduct(product);
    setShowPopup(true);
  }

  function handleClosePopup() {
    setShowPopup(false);
    setSelectedProduct(null);
  }

  return (
    <div className={`p-8 ${className}`}>
      <h1 className="text-4xl font-bold text-white mb-8">Browse Shop</h1>

      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Content States */}
      {viewModel.status === 'loading' && <LoadingState />}
      
      {viewModel.status === 'error' && (
        <ErrorState error={viewModel.error || 'Unknown error'} />
      )}

      {viewModel.status === 'success' && (
        <ProductGrid
          products={viewModel.products}
          onCardClick={handleCardClick}
          onBuyClick={handleBuyClick}
        />
      )}

      {/* Product Popup */}
      <ProductPopup
        product={selectedProduct}
        isOpen={showPopup}
        onClose={handleClosePopup}
        onBuyClick={handleBuyClick}
      />

      {/* Toast Notification */}
      <ToastNotification
        show={showToast}
        message="Coming soon! Cart functionality will be added soon."
        type="info"
      />
    </div>
  );
}
