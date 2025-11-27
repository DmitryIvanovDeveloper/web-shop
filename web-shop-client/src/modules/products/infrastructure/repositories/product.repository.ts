import { injectable, inject } from 'inversify';
import type { Product } from '../../domain/types';
import { ProductId } from '../../domain/value-objects/product-id.value-object';
import { Price } from '../../domain/value-objects/price.value-object';
import type { ProductRepositoryPort } from '../../application/ports/product-repository.port';
import type { HttpClient } from '../../../../application/ports/http-client.port';
import type { Logger } from '../../../../application/ports/logger.port';
import { TYPES, ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { ProductApiDto } from '../dtos/product.dto';

@injectable()
export class ProductRepository implements ProductRepositoryPort {
  public constructor(
    @inject(TYPES.HttpClient)
    private readonly _httpClient: HttpClient,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  public async getAll(): Promise<Product[]> {
    this._logger.info('[ProductRepository] Loading products via HTTP /api/products');

    const response = await this._httpClient.get<ProductApiDto[]>('/api/products');

    if (response.status !== 200) {
      this._logger.error('[ProductRepository] Failed to load products', {
        status: response.status,
        statusText: response.statusText,
      });
      throw new Error(response.statusText || 'Failed to load products');
    }

    const data = Array.isArray(response.data) ? response.data : [];

    const products = data.map((dto) => this._mapToDomain(dto));

    this._logger.info('[ProductRepository] Products loaded from HTTP', {
      count: products.length,
    });

    return products;
  }

  public async getById(id: string): Promise<Product | null> {
    this._logger.info('[ProductRepository] Loading product by ID via HTTP /api/products', {
      id,
    });

    const response = await this._httpClient.get<ProductApiDto[]>(
      `/api/products?${new URLSearchParams({ id }).toString()}`
    );

    if (response.status === 404) {
      this._logger.info('[ProductRepository] Product not found', { id });
      return null;
    }

    if (response.status !== 200) {
      this._logger.error('[ProductRepository] Failed to load product', {
        status: response.status,
        statusText: response.statusText,
        id,
      });
      throw new Error(response.statusText || 'Failed to load product');
    }

    const data = Array.isArray(response.data) ? response.data : [];
    const dto = data[0];

    if (!dto) {
      this._logger.info('[ProductRepository] Product not found in response', { id });
      return null;
    }

    return this._mapToDomain(dto);
  }

  private _mapToDomain(dto: ProductApiDto): Product {
    const priceValue = dto.price !== undefined && dto.price !== null ? dto.price : undefined;
    const price = priceValue !== undefined ? new Price(priceValue) : undefined;

    return {
      id: ProductId.fromString(dto.id),
      mainImage: dto.mainImage ?? undefined,
      backgroundImage: dto.backgroundImage ?? undefined,
      title: dto.title,
      titleStyle: dto.titleStyle ?? { fontSize: '18px' },
      rarity: dto.rarity ?? undefined,
      discount: dto.discount ?? undefined,
      playerLimit: dto.playerLimit ?? undefined,
      timer: dto.timer ? new Date(dto.timer) : undefined,
      // For backward compatibility in domain/UI, use the same price for both fields.
      originalPrice: price,
      currentPrice: price,
      rpBonus: dto.rpBonus ?? undefined,
      lpBonus: dto.lpBonus ?? undefined,
      appid: dto.appid,
      buyButton: {
        enabled: true,
      },
    };
  }
}

