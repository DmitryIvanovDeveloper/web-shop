import { Result } from '../../../../shared/domain/result/result';

export interface ProductImageStoragePort {
  uploadImage(buffer: ArrayBuffer, filename: string): Promise<Result<{ url: string }, Error>>;
  deleteImage(path: string): Promise<Result<void, Error>>;
}
