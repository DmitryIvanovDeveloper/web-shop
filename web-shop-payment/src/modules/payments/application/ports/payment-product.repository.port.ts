import { Result } from '../../../../shared/result/result';

export interface PaymentProduct {
  readonly id: string;
  readonly title: string;
  readonly price: number;
  readonly currency: string;
}

export interface PaymentProductRepositoryPort {
  getById(appId: string, productId: string): Promise<Result<PaymentProduct, Error>>;
}

