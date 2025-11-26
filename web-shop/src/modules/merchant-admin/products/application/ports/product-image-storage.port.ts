import { Result } from '../../../../../shared/domain/result/result';

/**
 * Product Image Storage Port
 * 
 * Interface for product image storage operations
 * Abstracts image storage implementation from business logic
 */
export interface ProductImageStoragePort {
  /**
   * Upload image to storage and return public URL
   * @param buffer - Image file as ArrayBuffer
   * @param filename - Original filename with extension
   * @returns Result with public URL or error
   */
  uploadImage(buffer: ArrayBuffer, filename: string): Promise<Result<{ url: string }, Error>>;

  /**
   * Delete image from storage
   * @param path - Image path in storage (optional, for future use)
   * @returns Result indicating success or error
   */
  deleteImage(path: string): Promise<Result<void, Error>>;
}

