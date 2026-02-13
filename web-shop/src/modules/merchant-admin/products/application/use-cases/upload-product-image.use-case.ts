import { inject, injectable } from 'inversify';
import { Result } from '@/shared/result/result';
import type { ProductImageStoragePort } from '../ports/product-image-storage.port';
import { PRODUCT_TYPES } from '../../infrastructure/bootstrap/products.types';
import type { Logger } from '../../../../../application/ports/logger.port';
import { ROOT_TYPES } from '../../../../../infrastructure/bootstrap/types';

export interface UploadProductImageInput {
  readonly file: File;
}

export interface UploadProductImageOutput {
  readonly url: string;
}

@injectable()
export class UploadProductImageUseCase {
  private readonly MAX_FILE_SIZE = 2 * 1024 * 1024; 
  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  public constructor(
    @inject(PRODUCT_TYPES.ProductImageStorage)
    private readonly imageStorage: ProductImageStoragePort,
    @inject(ROOT_TYPES.Logger)
    private readonly logger: Logger
  ) {}

  public async execute(
    input: UploadProductImageInput
  ): Promise<Result<UploadProductImageOutput, Error>> {
    
    if (!this.ALLOWED_TYPES.includes(input.file.type)) {
      const error = new Error(
        `Invalid file type. Allowed types: ${this.ALLOWED_TYPES.join(', ')}`
      );
            return Result.error(error);
    }

    if (input.file.size > this.MAX_FILE_SIZE) {
      const error = new Error(
        `File size exceeds maximum allowed size of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`
      );
            return Result.error(error);
    }

    try {
      
      const buffer = await input.file.arrayBuffer();

      const filename = input.file.name || 'image.jpg';

            const uploadResult = await this.imageStorage.uploadImage(buffer, filename);
      if (uploadResult.isFailure) {
                return Result.error(uploadResult.error!);
      }

            return Result.ok({ url: uploadResult.value!.url });
    } catch (error) {
            return Result.error(error as Error);
    }
  }
}






