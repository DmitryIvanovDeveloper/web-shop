import { inject, injectable } from 'inversify';
import { Result } from '../../../../../shared/domain/result/result';
import type { ProductImageStoragePort } from '../../application/ports/product-image-storage.port';
import type { Logger } from '../../../../../application/ports/logger.port';
import { ROOT_TYPES } from '../../../../../infrastructure/bootstrap/types';
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Product Image Storage Service
 *
 * Infrastructure implementation of ProductImageStoragePort using Supabase Storage.
 * - Stores images in the "Images" bucket.
 * - Uses content-hash-based keys to deduplicate identical files.
 * - Returns proxy URLs pointing to the image proxy API to avoid CORS/ORB issues.
 */
@injectable()
export class SupabaseProductImageStorageService implements ProductImageStoragePort {
  private readonly BUCKET_NAME = 'Images';
  private readonly SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  private readonly SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  /**
   * In-memory cache: content hash -> proxy URL
   * Works for the lifetime of the Node.js process and reduces Supabase calls
   * when the same file is uploaded multiple times.
   */
  private readonly urlCache = new Map<string, string>();

  constructor(
    @inject(ROOT_TYPES.Logger)
    private readonly logger: Logger
  ) {
    if (!this.SUPABASE_URL) {
      throw new Error('[SupabaseProductImageStorageService] NEXT_PUBLIC_SUPABASE_URL is not defined');
    }
    if (!this.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('[SupabaseProductImageStorageService] SUPABASE_SERVICE_ROLE_KEY is not defined');
    }
  }

  public async uploadImage(
    buffer: ArrayBuffer,
    filename: string
  ): Promise<Result<{ url: string }, Error>> {
    try {
      // Lazy-import crypto to avoid top-level Node-specific imports in shared bundles
      const { createHash } = await import('crypto');
      const nodeBuffer = Buffer.from(buffer);

      // 1) Compute content hash and deterministic object path
      const hash = createHash('sha256').update(nodeBuffer).digest('hex');
      const extension = filename.split('.').pop() || 'jpg';
      const objectPath = `products/${hash}.${extension.toLowerCase()}`;

      this.logger.info('[SupabaseProductImageStorageService] Starting image upload (with deduplication)', {
        originalFilename: filename,
        bucket: this.BUCKET_NAME,
        size: buffer.byteLength,
        hash,
        objectPath,
      });

      // 2) Check in-memory cache first
      const cachedUrl = this.urlCache.get(hash);
      if (cachedUrl) {
        this.logger.info('[SupabaseProductImageStorageService] Cache hit for image hash', {
          hash,
          objectPath,
          cachedUrl,
        });
        return Result.ok({ url: cachedUrl });
      }

      // 3) Create Supabase client
      const supabase = createClient(this.SUPABASE_URL!, this.SUPABASE_SERVICE_ROLE_KEY!);

      // 4) Check if object already exists in bucket via createSignedUrl
      this.logger.info('[SupabaseProductImageStorageService] Checking if image already exists in bucket', {
        objectPath,
      });

      const { error: existsError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .createSignedUrl(objectPath, 60);

      if (!existsError) {
        this.logger.info('[SupabaseProductImageStorageService] Image already exists in bucket, reusing URL', {
          hash,
          objectPath,
        });

        const reuseUrlResult = this.buildPublicUrl(supabase, objectPath);
        if (reuseUrlResult.isFailure()) {
          return reuseUrlResult;
        }

        const reusedUrl = reuseUrlResult.data!.url;
        this.urlCache.set(hash, reusedUrl);

        return Result.ok({ url: reusedUrl });
      }

      this.logger.info('[SupabaseProductImageStorageService] Image not found in bucket, uploading new object', {
        hash,
        objectPath,
        existsError: existsError?.message,
      });

      // 5) Upload new object
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(objectPath, nodeBuffer, {
          contentType: this.getContentType(filename),
          upsert: false, // do not overwrite existing files
        });

      if (error) {
        // If another process uploaded the same object first – reuse it
        if (error.message && error.message.toLowerCase().includes('already exists')) {
          this.logger.warn('[SupabaseProductImageStorageService] Upload reported \"already exists\", reusing existing object', {
            hash,
            objectPath,
            error: error.message,
          });

          const reuseUrlResult = this.buildPublicUrl(supabase, objectPath);
          if (reuseUrlResult.isFailure()) {
            return reuseUrlResult;
          }

          const reusedUrl = reuseUrlResult.data!.url;
          this.urlCache.set(hash, reusedUrl);

          return Result.ok({ url: reusedUrl });
        }

        this.logger.error('[SupabaseProductImageStorageService] Upload failed', {
          error: error.message,
          originalFilename: filename,
          objectPath,
        });
        return Result.error(new Error(`Failed to upload image: ${error.message}`));
      }

      if (!data) {
        this.logger.error('[SupabaseProductImageStorageService] Upload returned no data', {
          originalFilename: filename,
          objectPath,
        });
        return Result.error(new Error('Upload completed but no data returned'));
      }

      // 6) Build final proxy URL and cache it
      const urlResult = this.buildPublicUrl(supabase, data.path);
      if (urlResult.isFailure()) {
        return urlResult;
      }

      const finalUrl = urlResult.data!.url;
      this.urlCache.set(hash, finalUrl);

      this.logger.info('[SupabaseProductImageStorageService] Image uploaded successfully', {
        originalFilename: filename,
        path: data.path,
        publicUrl: finalUrl,
        hash,
      });

      return Result.ok({ url: finalUrl });
    } catch (error) {
      this.logger.error('[SupabaseProductImageStorageService] Unexpected error', {
        error,
        filename,
      });
      return Result.error(error as Error);
    }
  }

  public async deleteImage(path: string): Promise<Result<void, Error>> {
    try {
      this.logger.info('[SupabaseProductImageStorageService] Deleting image', {
        path,
        bucket: this.BUCKET_NAME,
      });

      const supabase = createClient(this.SUPABASE_URL!, this.SUPABASE_SERVICE_ROLE_KEY!);

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([path]);

      if (error) {
        this.logger.error('[SupabaseProductImageStorageService] Delete failed', {
          error: error.message,
          path,
        });
        return Result.error(new Error(`Failed to delete image: ${error.message}`));
      }

      this.logger.info('[SupabaseProductImageStorageService] Image deleted successfully', {
        path,
      });

      return Result.ok(undefined);
    } catch (error) {
      this.logger.error('[SupabaseProductImageStorageService] Unexpected error during delete', {
        error,
        path,
      });
      return Result.error(error as Error);
    }
  }

  /**
   * Determine content type from file extension
   */
  private getContentType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    const contentTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif',
    };
    return contentTypes[extension || ''] || 'image/jpeg';
  }

  /**
   * Build and validate public URL, then convert it to a proxy URL.
   */
  private buildPublicUrl(
    supabase: ReturnType<typeof createClient>,
    path: string
  ): Result<{ url: string }, Error> {
    const urlResponse = supabase.storage.from(this.BUCKET_NAME).getPublicUrl(path);

    this.logger.info('[SupabaseProductImageStorageService] getPublicUrl response', {
      path,
      urlResponseType: typeof urlResponse,
      urlResponseStringified: JSON.stringify(urlResponse, null, 2),
      urlResponseKeys: urlResponse ? Object.keys(urlResponse) : [],
      hasData: !!(urlResponse as any)?.data,
      dataType: typeof (urlResponse as any)?.data,
      dataKeys: (urlResponse as any)?.data ? Object.keys((urlResponse as any).data) : [],
      dataStringified: (urlResponse as any)?.data ? JSON.stringify((urlResponse as any).data, null, 2) : 'no data',
    });

    let publicUrl: string | undefined;

    if (urlResponse && typeof urlResponse === 'object') {
      if ((urlResponse as any).data && typeof (urlResponse as any).data === 'object') {
        publicUrl = (urlResponse as any).data.publicUrl;
      } else if ((urlResponse as any).publicUrl) {
        publicUrl = (urlResponse as any).publicUrl;
      }
    } else if (typeof urlResponse === 'string') {
      publicUrl = urlResponse;
    }

    this.logger.info('[SupabaseProductImageStorageService] Extracted URL', {
      urlResponseType: typeof urlResponse,
      urlResponseKeys: urlResponse ? Object.keys(urlResponse) : [],
      urlData: (urlResponse as any)?.data,
      publicUrl,
      publicUrlType: typeof publicUrl,
      publicUrlLength: publicUrl ? publicUrl.length : 0,
      publicUrlPreview: publicUrl ? publicUrl.substring(0, 150) : 'null',
      supabaseUrl: this.SUPABASE_URL,
      path,
    });

    if (!publicUrl || typeof publicUrl !== 'string') {
      this.logger.error('[SupabaseProductImageStorageService] Failed to get public URL', {
        path,
        urlResponse: JSON.stringify(urlResponse, null, 2),
        publicUrl,
        publicUrlType: typeof publicUrl,
      });
      return Result.error(
        new Error(`Failed to get public URL from Supabase. Response: ${JSON.stringify(urlResponse)}`)
      );
    }

    // Ensure full Supabase Storage URL
    if (!publicUrl.startsWith('http://') && !publicUrl.startsWith('https://')) {
      const baseUrl = this.SUPABASE_URL!.replace(/\/$/, '');
      publicUrl = `${baseUrl}/storage/v1/object/public/${this.BUCKET_NAME}/${path}`;
      this.logger.info('[SupabaseProductImageStorageService] Constructed full URL from relative path', {
        originalPath: path,
        constructedUrl: publicUrl,
      });
    }

    // Convert Supabase Storage URL to proxy URL
    const originalPublicUrl = publicUrl;
    if (publicUrl.includes('/storage/v1/object/public/')) {
      const proxyPath = publicUrl.split('/storage/v1/object/public/')[1];
      publicUrl = `/api/products/image/${proxyPath}`;
      this.logger.info('[SupabaseProductImageStorageService] Using proxy URL to avoid CORS/ORB', {
        originalUrl: originalPublicUrl,
        proxyUrl: publicUrl,
        path,
      });
    }

    // Proxy URL must be a relative path starting with '/'
    if (!publicUrl.startsWith('/')) {
      this.logger.error('[SupabaseProductImageStorageService] Invalid relative path format', {
        publicUrl,
      });
      return Result.error(new Error(`Invalid relative path format: ${publicUrl}`));
    }

    return Result.ok({ url: publicUrl });
  }
}


