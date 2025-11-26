import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { container } from '../../../../src/infrastructure/bootstrap/container';
import { PRODUCT_TYPES } from '../../../../src/modules/merchant-admin/products/infrastructure/bootstrap/products.types';
import type { UploadProductImageUseCase } from '../../../../src/modules/merchant-admin/products/application/use-cases/upload-product-image.use-case';
import type { ProductImageStoragePort } from '../../../../src/modules/merchant-admin/products/application/ports/product-image-storage.port';
import { SupabaseProductImageStorageService } from '../../../../src/modules/merchant-admin/products/infrastructure/storage/supabase-product-image-storage.service';

// Rebind ProductImageStorage for server-side to use direct Supabase access
// This ensures the API route uses the service role key
if (container.isBound(PRODUCT_TYPES.ProductImageStorage)) {
  container.unbind(PRODUCT_TYPES.ProductImageStorage);
}
container
  .bind<ProductImageStoragePort>(PRODUCT_TYPES.ProductImageStorage)
  .to(SupabaseProductImageStorageService)
  .inSingletonScope();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    // If file.type is empty or application/octet-stream, try to determine from extension
    let fileType = file.type;
    if (!fileType || fileType === 'application/octet-stream') {
      const extension = file.name.split('.').pop()?.toLowerCase();
      const mimeTypes: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        webp: 'image/webp',
      };
      fileType = mimeTypes[extension || ''] || fileType;
    }
    
    if (!allowedTypes.includes(fileType)) {
      console.log('[POST /api/products/upload-image] Invalid file type', {
        fileName: file.name,
        fileType: file.type,
        detectedType: fileType,
      });
      return NextResponse.json(
        { error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}. Received: ${file.type || 'unknown'}` },
        { status: 400 }
      );
    }

    // Validate file size (2MB max)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Get Use Case from DI container
    const uploadUseCase = container.get<UploadProductImageUseCase>(
      PRODUCT_TYPES.UploadProductImageUseCase
    );

    // Execute use case
    console.log('[POST /api/products/upload-image] Executing use case', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    const result = await uploadUseCase.execute({ file });

    if (result.isFailure()) {
      console.error('[POST /api/products/upload-image] Upload failed', {
        error: result.error,
        errorMessage: result.error?.message,
        errorStack: result.error?.stack,
        errorName: result.error?.name,
        fileName: file.name,
        errorStringified: JSON.stringify(result.error, Object.getOwnPropertyNames(result.error)),
      });
      return NextResponse.json(
        { error: result.error?.message || 'Failed to upload image' },
        { status: 500 }
      );
    }

    console.log('[POST /api/products/upload-image] Upload successful', {
      fileName: file.name,
      hasData: !!result.data,
      url: result.data?.url,
      urlType: typeof result.data?.url,
      urlLength: result.data?.url?.length,
    });

    if (!result.data || !result.data.url) {
      console.error('[POST /api/products/upload-image] Upload succeeded but no URL in result', {
        resultData: result.data,
      });
      return NextResponse.json(
        { error: 'Upload succeeded but no URL returned' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { url: result.data.url },
      { status: 200 }
    );
  } catch (error) {
    console.error('[POST /api/products/upload-image] Unexpected error', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
