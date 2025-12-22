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
import type { UploadProductImageUseCase } from '../../application/use-cases/upload-product-image.use-case';
import type { Product } from '../../domain/entities/product.entity';

type ViewModelUpdateCallback = () => void;

@injectable()
export class ProductsPresenter {
  private _viewModel: ProductsPageViewModel = initialProductsPageViewModel;
  private _subscribers: Set<ViewModelUpdateCallback> = new Set();
  private _appId: string | null = null;

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
    limitedOffer: 'Limited Offer',
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
    private readonly _createProductUseCase: CreateProductUseCase,
    @inject(PRODUCT_TYPES.UpdateProductUseCase)
    private readonly _updateProductUseCase: UpdateProductUseCase,
    @inject(PRODUCT_TYPES.DeleteProductUseCase)
    private readonly _deleteProductUseCase: DeleteProductUseCase,
    @inject(PRODUCT_TYPES.LoadProductsUseCase)
    private readonly _loadProductsUseCase: LoadProductsUseCase,
    @inject(PRODUCT_TYPES.UploadProductImageUseCase)
    private readonly _uploadProductImageUseCase: UploadProductImageUseCase,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  public subscribe(callback: ViewModelUpdateCallback): () => void {
    this._subscribers.add(callback);
    return () => {
      this._subscribers.delete(callback);
    };
  }

  private _notifySubscribers(): void {
    this._subscribers.forEach((callback) => callback());
  }

  public getViewModel(): ProductsPageViewModel {
    return this._viewModel;
  }

  public async init(appId: string): Promise<void> {
    this._appId = appId;
    await this.loadProducts();
  }

  public async loadProducts(): Promise<void> {
    if (!this._appId) {
      this._logger.error('[ProductsPresenter] Cannot load products: appId is not set');
      return;
    }

    this._viewModel = {
      ...this._viewModel,
      isLoading: true,
      errorMessage: null,
    };
    this._notifySubscribers();

    const result = await this._loadProductsUseCase.execute({ appId: this._appId });
    if (result.isFailure()) {
      this._logger.error('[ProductsPresenter] Failed to load products', { error: result.error });
      this._viewModel = {
        ...this._viewModel,
        isLoading: false,
        errorMessage: result.error?.message ?? 'Failed to load products',
      };
      this._notifySubscribers();
      return;
    }

    const products = result.data?.products ?? [];
    this._viewModel = {
      ...this._viewModel,
      isLoading: false,
      products: products.map(mapProductToListItem),
      errorMessage: null,
    };
    this._notifySubscribers();
  }

  public async createProduct(productData: Omit<ProductFormViewModel, 'id'>): Promise<void> {
    if (!this._appId) {
      this._logger.error('[ProductsPresenter] Cannot create product: appId is not set');
      return;
    }

    this._viewModel = {
      ...this._viewModel,
      isSaving: true,
      errorMessage: null,
    };
    this._notifySubscribers();

    const result = await this._createProductUseCase.execute({
      title: productData.title,
      appid: this._appId,
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
      this._logger.error('[ProductsPresenter] Failed to create product', { error: result.error });
      this._viewModel = {
        ...this._viewModel,
        isSaving: false,
        errorMessage: result.error?.message ?? 'Failed to create product',
      };
      this._notifySubscribers();
      return;
    }

    // Reload products to get updated list
    await this.loadProducts();

    // Close form
    this._viewModel = {
      ...this._viewModel,
      isSaving: false,
      selectedProduct: null,
      isCreating: false,
    };
    this._notifySubscribers();
  }

  public async updateProduct(id: string, productData: Omit<ProductFormViewModel, 'id' | 'appid'>): Promise<void> {
    if (!this._appId) {
      this._logger.error('[ProductsPresenter] Cannot update product: appId is not set');
      return;
    }

    this._viewModel = {
      ...this._viewModel,
      isSaving: true,
      errorMessage: null,
    };
    this._notifySubscribers();

    this._logger.info('[ProductsPresenter] Updating product', {
      id,
      main_image: productData.main_image ? (productData.main_image.startsWith('http') ? 'URL' : 'base64/data') : 'null',
    });

    console.log('[ProductsPresenter] updateProduct called with:', { id, appId: this._appId, description: productData.description });

    const result = await this._updateProductUseCase.execute({
      id,
      appId: this._appId,
      title: productData.title,
      description: productData.description,
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
      this._logger.error('[ProductsPresenter] Failed to update product', { error: result.error });
      this._viewModel = {
        ...this._viewModel,
        isSaving: false,
        errorMessage: result.error?.message ?? 'Failed to update product',
      };
      this._notifySubscribers();
      return;
    }

    // Update product in local view model without reloading the whole list
    if (!result.data) {
      this._logger.error('[ProductsPresenter] Update succeeded but no data returned');
      this._viewModel = {
        ...this._viewModel,
        isSaving: false,
        errorMessage: 'Update succeeded but no data returned',
      };
      this._notifySubscribers();
      return;
    }

    const updatedProduct = result.data.product;
    const updatedListItem = mapProductToListItem(updatedProduct);

    this._viewModel = {
      ...this._viewModel,
      isSaving: false,
      products: this._viewModel.products.map((p) =>
        p.id === updatedListItem.id ? updatedListItem : p
      ),
      errorMessage: null,
      selectedProduct: null,
      isEditing: false,
    };
    this._notifySubscribers();
  }

  public async deleteProduct(id: string): Promise<void> {
    if (!this._appId) {
      this._logger.error('[ProductsPresenter] Cannot delete product: appId is not set');
      return;
    }

    this._viewModel = {
      ...this._viewModel,
      isLoading: true,
      errorMessage: null,
    };
    this._notifySubscribers();

    const result = await this._deleteProductUseCase.execute({
      id,
      appId: this._appId,
    });

    if (result.isFailure()) {
      this._logger.error('[ProductsPresenter] Failed to delete product', { error: result.error });
      this._viewModel = {
        ...this._viewModel,
        isLoading: false,
        errorMessage: result.error?.message ?? 'Failed to delete product',
      };
      this._notifySubscribers();
      return;
    }

    // Reload products to get updated list
    await this.loadProducts();
  }

  public startCreating(): void {
    this._viewModel = {
      ...this._viewModel,
      isSaving: false,
      selectedProduct: {
        title: '',
        appid: this._appId,
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
    this._notifySubscribers();
  }

  public startEditing(product: ProductListItemViewModel): void {
    this._viewModel = {
      ...this._viewModel,
      isSaving: false,
      selectedProduct: {
        id: product.id,
        title: product.title,
        description: product.description,
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
    this._notifySubscribers();
  }

  public cancelForm(): void {
    this._viewModel = {
      ...this._viewModel,
      isSaving: false,
      selectedProduct: null,
      isCreating: false,
      isEditing: false,
    };
    this._notifySubscribers();
  }

  public async uploadProductImage(file: File): Promise<Result<string, Error>> {
    this._logger.info('[ProductsPresenter] Starting image upload', {
      fileName: file.name,
      fileSize: file.size,
    });

    const result = await this._uploadProductImageUseCase.execute({ file });

    if (result.isFailure()) {
      this._logger.error('[ProductsPresenter] Failed to upload image', {
        error: result.error,
        fileName: file.name,
      });
      return Result.error(result.error!);
    }

    this._logger.info('[ProductsPresenter] Image uploaded successfully', {
      url: result.data!.url,
    });

    return Result.ok(result.data!.url);
  }
}







