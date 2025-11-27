import type { Product } from '../../domain/entities/product.entity';

export interface ProductListItemViewModel {
  readonly id: string;
  readonly title: string;
  readonly appid: string | null;
  readonly main_image: string | null;
  readonly background_image: string | null;
  readonly rarity: string | null;
  readonly discount: string | null;
  readonly player_limit: string | null;
  readonly expires_at: string | null;
  readonly price: number | null;
  readonly rp_bonus: number | null;
  readonly lp_bonus: number | null;
  readonly created_at: string | null;
  readonly updated_at: string | null;
}

export interface ProductFormViewModel {
  readonly id?: string;
  readonly title: string;
  readonly appid: string | null;
  readonly main_image: string | null;
  readonly background_image: string | null;
  readonly rarity: string | null;
  readonly discount: string | null;
  readonly player_limit: string | null;
  readonly expires_at: string | null;
  readonly price: number | null;
  readonly rp_bonus: number | null;
  readonly lp_bonus: number | null;
}

export interface ProductsPageViewModel {
  readonly isLoading: boolean;
  readonly isSaving: boolean;
  readonly errorMessage: string | null;
  readonly products: readonly ProductListItemViewModel[];
  readonly selectedProduct: ProductFormViewModel | null;
  readonly isEditing: boolean;
  readonly isCreating: boolean;
}

export const initialProductsPageViewModel: ProductsPageViewModel = {
  isLoading: false,
  isSaving: false,
  errorMessage: null,
  products: [],
  selectedProduct: null,
  isEditing: false,
  isCreating: false,
};

export const mapProductToListItem = (product: Product): ProductListItemViewModel => {
  return {
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
    created_at: product.created_at,
    updated_at: product.updated_at,
  };
};

export const mapProductToForm = (product: Product | null): ProductFormViewModel | null => {
  if (!product) {
    return null;
  }
  return {
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
  };
};

