import type { Result } from '../../../../../shared/domain/result/result';

export interface Product {
  readonly id: string;
  readonly title: string;
  readonly appid: string;
}

export interface ProductQueryServicePort {
  loadProducts(appId: string): Promise<Result<readonly Product[], Error>>;
}


