import { inject, injectable } from 'inversify';
import { Result } from '../../../../../shared/domain/result/result';
import type { ProductImageStoragePort } from '../../application/ports/product-image-storage.port';
import { PRODUCT_TYPES } from '../../infrastructure/bootstrap/products.types';
import type { Logger } from '../../../../../application/ports/logger.port';
import { ROOT_TYPES } from '../../../../../infrastructure/bootstrap/types';
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Product Image Storage Service
 * 
 * Infrastructure implementation of ProductImageStoragePort using Supabase Storage
 * Uploads images to the "Images" bucket and returns public URLs
 */
@injectable()
export class SupabaseProductImageStorageService implements ProductImageStoragePort {
  private readonly BUCKET_NAME = 'Images';
  private readonly SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  private readonly SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
      this.logger.info('[SupabaseProductImageStorageService] Starting image upload', {
        filename,
        bucket: this.BUCKET_NAME,
        size: buffer.byteLength,
      });

      // Create Supabase client with service role key for server-side operations
      const supabase = createClient(this.SUPABASE_URL!, this.SUPABASE_SERVICE_ROLE_KEY!);

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filename, buffer, {
          contentType: this.getContentType(filename),
          upsert: false, // Don't overwrite existing files
        });

      if (error) {
        this.logger.error('[SupabaseProductImageStorageService] Upload failed', {
          error: error.message,
          filename,
        });
        return Result.error(new Error(`Failed to upload image: ${error.message}`));
      }

      if (!data) {
        this.logger.error('[SupabaseProductImageStorageService] Upload returned no data', {
          filename,
        });
        return Result.error(new Error('Upload completed but no data returned'));
      }

      // Get public URL
      // According to Supabase docs, getPublicUrl returns { data: { publicUrl: string } }
      // The path should be relative to the bucket root (e.g., "products/filename.png")
      const urlResponse = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(data.path);

      // Log full response structure for debugging
      this.logger.info('[SupabaseProductImageStorageService] getPublicUrl response', {
        path: data.path,
        urlResponseType: typeof urlResponse,
        urlResponseStringified: JSON.stringify(urlResponse, null, 2),
        urlResponseKeys: urlResponse ? Object.keys(urlResponse) : [],
        hasData: !!(urlResponse as any)?.data,
        dataType: typeof (urlResponse as any)?.data,
        dataKeys: (urlResponse as any)?.data ? Object.keys((urlResponse as any).data) : [],
        dataStringified: (urlResponse as any)?.data ? JSON.stringify((urlResponse as any).data, null, 2) : 'no data',
      });

      // Extract publicUrl from response
      // According to Supabase v2 docs: getPublicUrl returns { data: { publicUrl: string } }
      let publicUrl: string | undefined;
      
      // Check for standard format: { data: { publicUrl: string } }
      if (urlResponse && typeof urlResponse === 'object') {
        if ((urlResponse as any).data && typeof (urlResponse as any).data === 'object') {
          // Standard format: { data: { publicUrl: string } }
          publicUrl = (urlResponse as any).data.publicUrl;
        } else if ((urlResponse as any).publicUrl) {
          // Alternative format: { publicUrl: string }
          publicUrl = (urlResponse as any).publicUrl;
        }
      } else if (typeof urlResponse === 'string') {
        // Direct string response (unlikely but possible)
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
        path: data.path,
      });

      if (!publicUrl || typeof publicUrl !== 'string') {
        this.logger.error('[SupabaseProductImageStorageService] Failed to get public URL', {
          path: data.path,
          urlResponse: JSON.stringify(urlResponse, null, 2),
          publicUrl,
          publicUrlType: typeof publicUrl,
        });
        return Result.error(new Error(`Failed to get public URL from Supabase. Response: ${JSON.stringify(urlResponse)}`));
      }

      // Validate that publicUrl is actually a Supabase Storage URL
      // It should start with the Supabase URL or be a full URL
      if (!publicUrl.startsWith('http://') && !publicUrl.startsWith('https://')) {
        // It's a relative path, construct full URL
        const baseUrl = this.SUPABASE_URL!.replace(/\/$/, ''); // Remove trailing slash
        // Supabase Storage public URL format: {baseUrl}/storage/v1/object/public/{bucket}/{path}
        publicUrl = `${baseUrl}/storage/v1/object/public/${this.BUCKET_NAME}/${data.path}`;
        this.logger.info('[SupabaseProductImageStorageService] Constructed full URL from relative path', {
          originalPath: data.path,
          constructedUrl: publicUrl,
        });
      }

      // Use Next.js API route as proxy to avoid CORS/ORB issues
      // Convert Supabase Storage URL to proxy URL
      // Example: https://xxx.supabase.co/storage/v1/object/public/Images/products/file.png
      // To: /api/products/image/Images/products/file.png
      const originalPublicUrl = publicUrl;
      if (publicUrl.includes('/storage/v1/object/public/')) {
        const proxyPath = publicUrl.split('/storage/v1/object/public/')[1];
        // Use relative URL for same-origin requests (avoids CORS/ORB)
        publicUrl = `/api/products/image/${proxyPath}`;
        this.logger.info('[SupabaseProductImageStorageService] Using proxy URL to avoid CORS/ORB', {
          originalUrl: originalPublicUrl,
          proxyUrl: publicUrl,
          path: data.path,
        });
      }

      // Validate that the URL is actually a valid URL
      // For relative paths (proxy URLs), skip validation
      if (publicUrl.startsWith('http://') || publicUrl.startsWith('https://')) {
        try {
          new URL(publicUrl);
        } catch (urlError) {
          this.logger.error('[SupabaseProductImageStorageService] Invalid URL format', {
            publicUrl,
            urlError: urlError instanceof Error ? urlError.message : String(urlError),
            urlErrorStack: urlError instanceof Error ? urlError.stack : undefined,
          });
          return Result.error(new Error(`Failed to parse URL from ${publicUrl}. Error: ${urlError instanceof Error ? urlError.message : String(urlError)}`));
        }
      } else if (!publicUrl.startsWith('/')) {
        // Relative path should start with /
        this.logger.error('[SupabaseProductImageStorageService] Invalid relative path format', {
          publicUrl,
        });
        return Result.error(new Error(`Invalid relative path format: ${publicUrl}`));
      }

      this.logger.info('[SupabaseProductImageStorageService] Image uploaded successfully', {
        filename,
        path: data.path,
        publicUrl,
      });

      return Result.ok({ url: publicUrl });
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
}

