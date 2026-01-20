import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { container } from '../../../../src/infrastructure/bootstrap/container';
import { PRODUCT_TYPES } from '../../../../src/modules/merchant-admin/products/infrastructure/bootstrap/products.types';
import type { UploadProductImageUseCase } from '../../../../src/modules/merchant-admin/products/application/use-cases/upload-product-image.use-case';
import type { ProductImageStoragePort } from '../../../../src/modules/merchant-admin/products/application/ports/product-image-storage.port';
import { SupabaseProductImageStorageService } from '../../../../src/modules/merchant-admin/products/infrastructure/storage/supabase-product-image-storage.service';

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

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

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
            return NextResponse.json(
        { error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}. Received: ${file.type || 'unknown'}` },
        { status: 400 }
      );
    }

    const maxSize = 2 * 1024 * 1024; 
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    const uploadUseCase = container.get<UploadProductImageUseCase>(
      PRODUCT_TYPES.UploadProductImageUseCase
    );

        const result = await uploadUseCase.execute({ file });

    if (result.isFailure()) {
      ),
      });
      return NextResponse.json(
        { error: result.error?.message || 'Failed to upload image' },
        { status: 500 }
      );
    }

        if (!result.data || !result.data.url) {
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
        return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}