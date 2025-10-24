import { injectable, inject } from 'inversify';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ProductStoragePort } from '../../application/ports/product-storage.port';
import { Product } from '../../domain/types';
import { ProductId } from '../../domain/value-objects/product-id.value-object';
import { Price } from '../../domain/value-objects/price.value-object';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';

/**
 * Supabase Product Storage Implementation
 * 
 * Infrastructure implementation of ProductStoragePort using Supabase
 * Handles product data operations through Supabase API
 */
@injectable()
export class SupabaseProductStorage implements ProductStoragePort {
  private readonly _supabase: SupabaseClient;

  constructor(
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and Anon Key must be provided');
    }

    this._supabase = createClient(supabaseUrl, supabaseKey);
  }

  public async getAll(): Promise<Product[]> {
    try {
      this._logger.info('[SupabaseProductStorage] Loading all products from Supabase');

      const { data, error } = await this._supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        this._logger.error('[SupabaseProductStorage] Failed to load products', { error });
        throw new Error(`Failed to load products: ${error.message}`);
      }

      const products = data?.map(item => this._mapDatabaseToDomain(item)) || [];
      
      this._logger.info('[SupabaseProductStorage] Products loaded successfully', { 
        count: products.length 
      });

      return products;
    } catch (error) {
      this._logger.error('[SupabaseProductStorage] Unexpected error loading products', { error });
      throw error;
    }
  }

  public async getById(id: string): Promise<Product | null> {
    try {
      this._logger.info('[SupabaseProductStorage] Loading product by ID', { productId: id });

      const { data, error } = await this._supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          this._logger.info('[SupabaseProductStorage] Product not found', { productId: id });
          return null;
        }
        
        this._logger.error('[SupabaseProductStorage] Failed to load product', { 
          error, 
          productId: id 
        });
        throw new Error(`Failed to load product: ${error.message}`);
      }

      const product = this._mapDatabaseToDomain(data);
      
      this._logger.info('[SupabaseProductStorage] Product loaded successfully', { 
        productId: id,
        title: product.title 
      });

      return product;
    } catch (error) {
      this._logger.error('[SupabaseProductStorage] Unexpected error loading product', { 
        error, 
        productId: id 
      });
      throw error;
    }
  }

  /**
   * Map database fields (snake_case) to domain model (camelCase)
   */
  private _mapDatabaseToDomain(dbProduct: any): Product {
    const paymentUrl = process.env.NEXT_PUBLIC_PAYMENT_URL || 'https://web-shop-payment-ie54yubx2-dmitryivanovdeveloper-5910s-projects.vercel.app';
    const productPrice = dbProduct.current_price || dbProduct.original_price || 0;
    
    return {
      id: ProductId.fromString(dbProduct.id),
      mainImage: dbProduct.main_image,
      backgroundImage: dbProduct.background_image,
      title: dbProduct.title,
      rarity: dbProduct.rarity,
      discount: dbProduct.discount,
      playerLimit: dbProduct.player_limit,
      timer: dbProduct.expires_at ? new Date(dbProduct.expires_at) : undefined,
      originalPrice: dbProduct.original_price ? new Price(dbProduct.original_price) : undefined,
      currentPrice: dbProduct.current_price ? new Price(dbProduct.current_price) : undefined,
      rpBonus: dbProduct.rp_bonus,
      lpBonus: dbProduct.lp_bonus,
      appid: dbProduct.appid,
      buyButton: {
        enabled: true,
        redirectUrl: `${paymentUrl}/payment?product_id=${dbProduct.id}&price=${productPrice}&currency=USD&title=${encodeURIComponent(dbProduct.title || '')}`,
        style: {
          backgroundColor: "rgb(255, 215, 0)",
          textColor: "#000000",
          borderRadius: "8px",
          padding: "12px 24px",
          fontWeight: "bold"
        }
      }
    };
  }

  /**
   * Format price with dollar sign (legacy method - now handled by Price Value Object)
   * @deprecated Use Price Value Object instead
   */
  private _formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }
}
    