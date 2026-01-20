import { inject, injectable } from 'inversify';
import { Result } from '../../../../../shared/domain/result/result';
import type { ProductImageStoragePort } from '../../application/ports/product-image-storage.port';
import { PRODUCT_TYPES } from '../bootstrap/products.types';
import type { Logger } from '../../../../../application/ports/logger.port';
import { ROOT_TYPES } from '../../../../../infrastructure/bootstrap/types';

@injectable()
export class SupabaseProductImageStorageService implements ProductImageStoragePort {
  constructor(
    @inject(ROOT_TYPES.Logger)
    private readonly logger: Logger
  ) {}

  public async uploadImage(buffer: ArrayBuffer, filename: string): Promise<Result<{ url: string }, Error>> {
    
        return Result.error(new Error('Upload not implemented'));
  }

  public async deleteImage(path: string): Promise<Result<void, Error>> {
    
        return Result.error(new Error('Delete not implemented'));
  }
}
