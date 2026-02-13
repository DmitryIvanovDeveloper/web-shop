import type { Result } from '@/shared/result/result';

export interface Product {
  readonly id: string;
  readonly title: string;
  readonly appid: string;
  readonly price?: number | null;
}

export interface ProductQueryServicePort {
  loadProducts(appId: string): Promise<Result<readonly Product[], Error>>;
}






