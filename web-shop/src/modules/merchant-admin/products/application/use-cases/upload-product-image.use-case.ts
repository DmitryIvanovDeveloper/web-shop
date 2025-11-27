import { inject, injectable } from 'inversify';
import { Result } from '../../../../../shared/domain/result/result';
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
  private readonly MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
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
    // Validate file type
    if (!this.ALLOWED_TYPES.includes(input.file.type)) {
      const error = new Error(
        `Invalid file type. Allowed types: ${this.ALLOWED_TYPES.join(', ')}`
      );
      this.logger.error('[UploadProductImageUseCase] Invalid file type', {
        fileType: input.file.type,
        fileName: input.file.name,
      });
      return Result.error(error);
    }

    // Validate file size
    if (input.file.size > this.MAX_FILE_SIZE) {
      const error = new Error(
        `File size exceeds maximum allowed size of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`
      );
      this.logger.error('[UploadProductImageUseCase] File size too large', {
        fileSize: input.file.size,
        maxSize: this.MAX_FILE_SIZE,
        fileName: input.file.name,
      });
      return Result.error(error);
    }

    try {
      // Convert File to ArrayBuffer
      const buffer = await input.file.arrayBuffer();

      // Use original filename (only extension is important, storage service will build deterministic key)
      const filename = input.file.name || 'image.jpg';

      this.logger.info('[UploadProductImageUseCase] Uploading image', {
        filename,
        size: buffer.byteLength,
      });

      // Upload via port interface
      const uploadResult = await this.imageStorage.uploadImage(buffer, filename);
      if (uploadResult.isFailure()) {
        this.logger.error('[UploadProductImageUseCase] Failed to upload image', {
          error: uploadResult.error,
          filename,
        });
        return Result.error(uploadResult.error!);
      }

      this.logger.info('[UploadProductImageUseCase] Image uploaded successfully', {
        filename,
        url: uploadResult.data!.url,
      });

      return Result.ok({ url: uploadResult.data!.url });
    } catch (error) {
      this.logger.error('[UploadProductImageUseCase] Unexpected error', {
        error,
        fileName: input.file.name,
      });
      return Result.error(error as Error);
    }
  }
}
