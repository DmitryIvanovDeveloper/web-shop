import { inject, injectable } from 'inversify';
import { Result } from '../../../../../shared/domain/result/result';
import { Product } from '../../domain/entities/product.entity';
import type { ProductCommandServicePort } from '../../application/ports/product-command-service.port';
import type { ProductQueryServicePort } from '../../application/ports/product-query-service.port';
import type { HttpClient } from '../../../../../application/ports/http-client.port';
import type { Logger } from '../../../../../application/ports/logger.port';
import { ROOT_TYPES } from '../../../../../infrastructure/bootstrap/types';
import { TYPES } from '../../../../../infrastructure/bootstrap/types';
import { ProductNotFoundError } from '../../domain/errors/product.error';

interface ProductsApiResponse {
  products: ProductDto[];
}

interface ProductDto {
  id: string;
  title: string;
  appid?: string | null;
  main_image?: string | null;
  background_image?: string | null;
  rarity?: string | null;
  discount?: string | null;
  player_limit?: string | null;
  expires_at?: string | null;
  price?: number | null;
  rp_bonus?: number | null;
  lp_bonus?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface CreateProductRequest {
  appId: string;
  product: ProductDto;
}

interface UpdateProductRequest {
  appId: string;
  id: string;
  product: ProductDto;
}

const mapDtoToProduct = (dto: ProductDto): Result<Product, Error> => {
  return Product.create({
    id: dto.id,
    title: dto.title,
    appid: dto.appid ?? null,
    main_image: dto.main_image ?? null,
    background_image: dto.background_image ?? null,
    rarity: dto.rarity ?? null,
    discount: dto.discount ?? null,
    player_limit: dto.player_limit ?? null,
    expires_at: dto.expires_at ?? null,
    price: dto.price ?? null,
    rp_bonus: dto.rp_bonus ?? null,
    lp_bonus: dto.lp_bonus ?? null,
    created_at: dto.created_at ?? null,
    updated_at: dto.updated_at ?? null,
  });
};

const mapProductToDto = (product: Product): ProductDto => {
  return {
    id: product.id,
    title: product.title,
    appid: product.appid,
    main_image: product.main_image,
    background_image: product.background_image,
    rarity: product.rarity,
    discount: product.discount,
    player_limit: product.player_limit,
    expires_at: product.expires_at,
    price: product.price,
    rp_bonus: product.rp_bonus,
    lp_bonus: product.lp_bonus,
    created_at: product.created_at,
    updated_at: product.updated_at,
  };
};

@injectable()
export class ProductApiRepository implements ProductQueryServicePort, ProductCommandServicePort {
  public constructor(
    @inject(TYPES.HttpClient)
    private readonly httpClient: HttpClient,
    @inject(ROOT_TYPES.Logger)
    private readonly logger: Logger
  ) {}

  public async loadAll(appId: string): Promise<Result<readonly Product[], Error>> {
    try {
      const response = await this.httpClient.get<ProductsApiResponse>(
        `/api/products?appId=${encodeURIComponent(appId)}`
      );

      if (response.status !== 200) {
        this.logger.error('[ProductApiRepository] Failed to load products', {
          status: response.status,
          appId,
        });
        return Result.error(new Error(`Failed to load products: ${response.statusText}`));
      }

      const dtos = response.data?.products ?? [];
      const products: Product[] = [];

      for (const dto of dtos) {
        const productResult = mapDtoToProduct(dto);
        if (productResult.isFailure()) {
          this.logger.error('[ProductApiRepository] Failed to map product DTO', {
            error: productResult.error,
            dto,
          });
          continue;
        }
        products.push(productResult.data!);
      }

      return Result.ok(products);
    } catch (error) {
      this.logger.error('[ProductApiRepository] Unexpected load error', { error, appId });
      return Result.error(error as Error);
    }
  }

  public async loadById(id: string, appId: string): Promise<Result<Product, Error>> {
    try {
      const allProductsResult = await this.loadAll(appId);
      if (allProductsResult.isFailure()) {
        return Result.error(allProductsResult.error!);
      }

      const product = allProductsResult.data?.find((p) => p.id === id);
      if (!product) {
        return Result.error(new ProductNotFoundError(`Product with id ${id} not found`));
      }

      return Result.ok(product);
    } catch (error) {
      this.logger.error('[ProductApiRepository] Unexpected loadById error', { error, id, appId });
      return Result.error(error as Error);
    }
  }

  public async create(product: Product): Promise<Result<Product, Error>> {
    try {
      if (!product.appid) {
        return Result.error(new Error('Product appid is required for creation'));
      }

      const dto = mapProductToDto(product);
      const payload: CreateProductRequest = {
        appId: product.appid,
        product: dto,
      };

      const response = await this.httpClient.post<ProductDto>(`/api/products`, payload);

      if (response.status !== 200 && response.status !== 201) {
        this.logger.error('[ProductApiRepository] Failed to create product', {
          status: response.status,
          productId: product.id,
        });
        return Result.error(new Error(`Failed to create product: ${response.statusText}`));
      }

      const createdDto = response.data;
      if (!createdDto) {
        return Result.error(new Error('Invalid response format from API'));
      }

      const productResult = mapDtoToProduct(createdDto);
      if (productResult.isFailure()) {
        return Result.error(productResult.error!);
      }

      return Result.ok(productResult.data!);
    } catch (error) {
      this.logger.error('[ProductApiRepository] Unexpected create error', { error, productId: product.id });
      return Result.error(error as Error);
    }
  }

  public async update(product: Product): Promise<Result<Product, Error>> {
    try {
      if (!product.appid) {
        return Result.error(new Error('Product appid is required for update'));
      }

      const dto = mapProductToDto(product);
      const payload: UpdateProductRequest = {
        appId: product.appid,
        id: product.id,
        product: dto,
      };

      const response = await this.httpClient.put<ProductDto>(`/api/products`, payload);

      if (response.status !== 200) {
        this.logger.error('[ProductApiRepository] Failed to update product', {
          status: response.status,
          productId: product.id,
        });
        return Result.error(new Error(`Failed to update product: ${response.statusText}`));
      }

      const updatedDto = response.data;
      if (!updatedDto) {
        return Result.error(new Error('Invalid response format from API'));
      }

      const productResult = mapDtoToProduct(updatedDto);
      if (productResult.isFailure()) {
        return Result.error(productResult.error!);
      }

      return Result.ok(productResult.data!);
    } catch (error) {
      this.logger.error('[ProductApiRepository] Unexpected update error', { error, productId: product.id });
      return Result.error(error as Error);
    }
  }

  public async delete(id: string, appId: string): Promise<Result<void, Error>> {
    try {
      const response = await this.httpClient.delete<{ success: boolean }>(
        `/api/products?id=${encodeURIComponent(id)}&appId=${encodeURIComponent(appId)}`
      );

      if (response.status !== 200) {
        this.logger.error('[ProductApiRepository] Failed to delete product', {
          status: response.status,
          productId: id,
        });
        return Result.error(new Error(`Failed to delete product: ${response.statusText}`));
      }

      return Result.ok(undefined);
    } catch (error) {
      this.logger.error('[ProductApiRepository] Unexpected delete error', { error, productId: id, appId });
      return Result.error(error as Error);
    }
  }
}

