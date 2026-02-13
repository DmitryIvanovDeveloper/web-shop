import { Result } from '@/shared/result/result';

export interface ProductImageStoragePort {
  uploadImage(buffer: ArrayBuffer, filename: string): Promise<Result<{ url: string }, Error>>;
  deleteImage(path: string): Promise<Result<void, Error>>;
}






