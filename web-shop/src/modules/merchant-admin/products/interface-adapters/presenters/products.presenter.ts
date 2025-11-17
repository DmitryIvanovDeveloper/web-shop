import { inject, injectable } from 'inversify';
import { Result } from '../../../../../shared/domain/result/result';
import { PRODUCT_TYPES } from '../../infrastructure/bootstrap/products.types';
import type {
  ProductsPageViewModel,
  ProductFormViewModel,
  ProductListItemViewModel,
} from '../view-models/products.view-model';
import {
  initialProductsPageViewModel,
  mapProductToListItem,
  mapProductToForm,
} from '../view-models/products.view-model';
import type { Logger } from '../../../../../application/ports/logger.port';
import { ROOT_TYPES } from '../../../../../infrastructure/bootstrap/types';
import type { CreateProductUseCase } from '../../application/use-cases/create-product.use-case';
import type { UpdateProductUseCase } from '../../application/use-cases/update-product.use-case';
import type { DeleteProductUseCase } from '../../application/use-cases/delete-product.use-case';
import type { LoadProductsUseCase } from '../../application/use-cases/load-products.use-case';
import type { Product } from '../../domain/entities/product.entity';

type ViewModelUpdateCallback = () => void;

@injectable()
export class ProductsPresenter {
  private viewModel: ProductsPageViewModel = initialProductsPageViewModel;
  private subscribers: Set<ViewModelUpdateCallback> = new Set();
  private appId: string | null = null;

  public readonly labels = {
    pageTitle: 'Products Management',
    addProduct: 'Add Product',
    editProduct: 'Edit Product',
    deleteProduct: 'Delete Product',
    save: 'Save',
    cancel: 'Cancel',
    title: 'Title',
    appid: 'App ID',
    mainImage: 'Main Image URL',
    backgroundImage: 'Background Image URL',
    rarity: 'Rarity',
    discount: 'Discount',
    playerLimit: 'Player Limit',
    expiresAt: 'Expires At',
    price: 'Price',
    rpBonus: 'RP Bonus',
    lpBonus: 'LP Bonus',
    loading: 'Loading products...',
    error: 'Error loading products',
    noProducts: 'No products found',
    deleteConfirm: 'Are you sure you want to delete this product?',
  };

  public constructor(
    @inject(PRODUCT_TYPES.CreateProductUseCase)
    private readonly createProductUseCase: CreateProductUseCase,
    @inject(PRODUCT_TYPES.UpdateProductUseCase)
    private readonly updateProductUseCase: UpdateProductUseCase,
    @inject(PRODUCT_TYPES.DeleteProductUseCase)
    private readonly deleteProductUseCase: DeleteProductUseCase,
    @inject(PRODUCT_TYPES.LoadProductsUseCase)
    private readonly loadProductsUseCase: LoadProductsUseCase,
    @inject(ROOT_TYPES.Logger)
    private readonly logger: Logger
  ) {}

  public subscribe(callback: ViewModelUpdateCallback): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((callback) => callback());
  }

  public getViewModel(): ProductsPageViewModel {
    return this.viewModel;
  }

  public async init(appId: string): Promise<void> {
    this.appId = appId;
    await this.loadProducts();
  }

  public async loadProducts(): Promise<void> {
    if (!this.appId) {
      this.logger.error('[ProductsPresenter] Cannot load products: appId is not set');
      return;
    }

    this.viewModel = {
      ...this.viewModel,
      isLoading: true,
      errorMessage: null,
    };
    this.notifySubscribers();

    const result = await this.loadProductsUseCase.execute({ appId: this.appId });
    if (result.isFailure()) {
      this.logger.error('[ProductsPresenter] Failed to load products', { error: result.error });
      this.viewModel = {
        ...this.viewModel,
        isLoading: false,
        errorMessage: result.error?.message ?? 'Failed to load products',
      };
      this.notifySubscribers();
      return;
    }

    const products = result.data?.products ?? [];
    this.viewModel = {
      ...this.viewModel,
      isLoading: false,
      products: products.map(mapProductToListItem),
      errorMessage: null,
    };
    this.notifySubscribers();
  }

  public async createProduct(productData: Omit<ProductFormViewModel, 'id'>): Promise<void> {
    if (!this.appId) {
      this.logger.error('[ProductsPresenter] Cannot create product: appId is not set');
      return;
    }

    this.viewModel = {
      ...this.viewModel,
      isLoading: true,
      errorMessage: null,
    };
    this.notifySubscribers();

    const result = await this.createProductUseCase.execute({
      title: productData.title,
      appid: this.appId,
      main_image: productData.main_image,
      background_image: productData.background_image,
      rarity: productData.rarity,
      discount: productData.discount,
      player_limit: productData.player_limit,
      expires_at: productData.expires_at,
      price: productData.price,
      rp_bonus: productData.rp_bonus,
      lp_bonus: productData.lp_bonus,
    });

    if (result.isFailure()) {
      this.logger.error('[ProductsPresenter] Failed to create product', { error: result.error });
      this.viewModel = {
        ...this.viewModel,
        isLoading: false,
        errorMessage: result.error?.message ?? 'Failed to create product',
      };
      this.notifySubscribers();
      return;
    }

    // Reload products to get updated list
    await this.loadProducts();

    // Close form
    this.viewModel = {
      ...this.viewModel,
      selectedProduct: null,
      isCreating: false,
    };
    this.notifySubscribers();
  }

  public async updateProduct(id: string, productData: Omit<ProductFormViewModel, 'id' | 'appid'>): Promise<void> {
    if (!this.appId) {
      this.logger.error('[ProductsPresenter] Cannot update product: appId is not set');
      return;
    }

    this.viewModel = {
      ...this.viewModel,
      isLoading: true,
      errorMessage: null,
    };
    this.notifySubscribers();

    const result = await this.updateProductUseCase.execute({
      id,
      appId: this.appId,
      title: productData.title,
      main_image: productData.main_image,
      background_image: productData.background_image,
      rarity: productData.rarity,
      discount: productData.discount,
      player_limit: productData.player_limit,
      expires_at: productData.expires_at,
      price: productData.price,
      rp_bonus: productData.rp_bonus,
      lp_bonus: productData.lp_bonus,
    });

    if (result.isFailure()) {
      this.logger.error('[ProductsPresenter] Failed to update product', { error: result.error });
      this.viewModel = {
        ...this.viewModel,
        isLoading: false,
        errorMessage: result.error?.message ?? 'Failed to update product',
      };
      this.notifySubscribers();
      return;
    }

    // Reload products to get updated list
    await this.loadProducts();

    // Close form
    this.viewModel = {
      ...this.viewModel,
      selectedProduct: null,
      isEditing: false,
    };
    this.notifySubscribers();
  }

  public async deleteProduct(id: string): Promise<void> {
    if (!this.appId) {
      this.logger.error('[ProductsPresenter] Cannot delete product: appId is not set');
      return;
    }

    this.viewModel = {
      ...this.viewModel,
      isLoading: true,
      errorMessage: null,
    };
    this.notifySubscribers();

    const result = await this.deleteProductUseCase.execute({
      id,
      appId: this.appId,
    });

    if (result.isFailure()) {
      this.logger.error('[ProductsPresenter] Failed to delete product', { error: result.error });
      this.viewModel = {
        ...this.viewModel,
        isLoading: false,
        errorMessage: result.error?.message ?? 'Failed to delete product',
      };
      this.notifySubscribers();
      return;
    }

    // Reload products to get updated list
    await this.loadProducts();
  }

  public startCreating(): void {
    this.viewModel = {
      ...this.viewModel,
      selectedProduct: {
        title: '',
        appid: this.appId,
        main_image: null,
        background_image: null,
        rarity: null,
        discount: null,
        player_limit: null,
        expires_at: null,
        price: null,
        rp_bonus: null,
        lp_bonus: null,
      },
      isCreating: true,
      isEditing: false,
    };
    this.notifySubscribers();
  }

  public startEditing(product: ProductListItemViewModel): void {
    this.viewModel = {
      ...this.viewModel,
      selectedProduct: {
        id: product.id,
        title: product.title,
        appid: product.appid,
        main_image: product.main_image,
        background_image: product.background_image,
        rarity: product.rarity,
        discount: product.discount,
        player_limit: product.player_limit,
        expires_at: product.expires_at,
        price: product.price,
        rp_bonus: product.rp_bonus,
        lp_bonus: product.lp_bonus,
      },
      isCreating: false,
      isEditing: true,
    };
    this.notifySubscribers();
  }

  public cancelForm(): void {
    this.viewModel = {
      ...this.viewModel,
      selectedProduct: null,
      isCreating: false,
      isEditing: false,
    };
    this.notifySubscribers();
  }
}

