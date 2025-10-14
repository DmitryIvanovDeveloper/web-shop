import { Result } from '../../../../shared/domain/result/result';
import { ProductValidationError } from '../errors/shop.error';

export class Product {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly price: number,
    public readonly imageUrl: string,
    public readonly category: string,
    public readonly inStock: boolean,
    public readonly originalPrice?: number,
    public readonly discount?: number,
    public readonly icon?: string,
    public readonly categoryLabel?: string,
    public readonly rp?: number,
    public readonly lp?: number
  ) {}

  static create(props: {
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    imageUrl: string;
    category: string;
    inStock: boolean;
    discount?: number;
    icon?: string;
    categoryLabel?: string;
    rp?: number;
    lp?: number;
  }): Result<Product, ProductValidationError> {
    // Валидация бизнес-правил
    if (!props.name || props.name.trim().length === 0) {
      return Result.error(new ProductValidationError('Product name is required'));
    }
    if (props.price < 0) {
      return Result.error(new ProductValidationError('Product price cannot be negative'));
    }
    
    return Result.ok(new Product(
      props.id,
      props.name,
      props.description,
      props.price,
      props.imageUrl,
      props.category,
      props.inStock,
      props.originalPrice,
      props.discount,
      props.icon,
      props.categoryLabel,
      props.rp,
      props.lp
    ));
  }
}
