export interface ProductData {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly originalPrice?: number;
  readonly imageUrl: string;
  readonly category: string;
  readonly inStock: boolean;
  readonly discount?: number;
  readonly icon?: string;
  readonly categoryLabel?: string;
  readonly rp?: number;
  readonly lp?: number;
}

export interface GetProductsRequest {
  readonly category?: string;
  readonly limit?: number;
}
