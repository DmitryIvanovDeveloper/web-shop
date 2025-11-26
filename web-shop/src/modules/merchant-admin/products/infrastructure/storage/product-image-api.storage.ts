import { inject, injectable } from 'inversify';
import { Result } from '../../../../../shared/domain/result/result';
import type { ProductImageStoragePort } from '../../application/ports/product-image-storage.port';
import { PRODUCT_TYPES } from '../../infrastructure/bootstrap/products.types';
import type { Logger } from '../../../../../application/ports/logger.port';
import type { HttpClient } from '../../../../../application/ports/http-client.port';
import { ROOT_TYPES } from '../../../../../infrastructure/bootstrap/types';
import { TYPES } from '../../../../../infrastructure/bootstrap/types';

interface UploadImageResponse {
  url: string;
}

interface UploadImageErrorResponse {
  error: string;
}

/**
 * Product Image API Storage
 * 
 * Infrastructure implementation of ProductImageStoragePort using HTTP API route
 * Uploads images via /api/products/upload-image endpoint
 */
@injectable()
export class ProductImageApiStorage implements ProductImageStoragePort {
  constructor(
    @inject(TYPES.HttpClient)
    private readonly httpClient: HttpClient,
    @inject(ROOT_TYPES.Logger)
    private readonly logger: Logger
  ) {}

  public async uploadImage(
    buffer: ArrayBuffer,
    filename: string
  ): Promise<Result<{ url: string }, Error>> {
    try {
      this.logger.info('[ProductImageApiStorage] Starting image upload via API', {
        filename,
        size: buffer.byteLength,
      });

      // Determine MIME type from file extension
      const extension = filename.split('.').pop()?.toLowerCase();
      const mimeTypes: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        webp: 'image/webp',
        gif: 'image/gif',
      };
      const mimeType = mimeTypes[extension || ''] || 'image/png';

      // Convert ArrayBuffer to Blob with correct MIME type for FormData
      const blob = new Blob([buffer], { type: mimeType });
      const formData = new FormData();
      // Create File object with correct type
      const file = new File([blob], filename, { type: mimeType });
      formData.append('file', file);

      // Use fetch directly for FormData (HttpClient may not support it properly)
      const response = await fetch('/api/products/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        const errorMessage = (errorData as UploadImageErrorResponse).error || `Upload failed with status ${response.status}`;
        this.logger.error('[ProductImageApiStorage] Upload failed', {
          status: response.status,
          error: errorMessage,
          filename,
        });
        return Result.error(new Error(errorMessage));
      }

      const data = await response.json() as UploadImageResponse;

      if (!data.url) {
        this.logger.error('[ProductImageApiStorage] No URL in response', {
          response: data,
        });
        return Result.error(new Error('No URL returned from upload'));
      }

      this.logger.info('[ProductImageApiStorage] Image uploaded successfully', {
        filename,
        url: data.url,
      });

      return Result.ok({ url: data.url });
    } catch (error) {
      this.logger.error('[ProductImageApiStorage] Unexpected error', {
        error,
        filename,
      });
      return Result.error(error as Error);
    }
  }

  public async deleteImage(path: string): Promise<Result<void, Error>> {
    // TODO: Implement delete via API route if needed
    this.logger.warn('[ProductImageApiStorage] Delete not implemented yet', { path });
    return Result.error(new Error('Delete image not implemented'));
  }
}

