import { inject, injectable } from 'inversify';
import { Result } from '@/shared/result/result';
import type { ProductCommandServicePort } from '../ports/product-command-service.port';
import { PRODUCT_TYPES } from '../../infrastructure/bootstrap/products.types';

export interface DeleteProductInput {
  readonly id: string;
  readonly appId: string;
}

export interface DeleteProductOutput {
  readonly success: boolean;
}

@injectable()
export class DeleteProductUseCase {
  public constructor(
    @inject(PRODUCT_TYPES.ProductCommandService)
    private readonly commandService: ProductCommandServicePort
  ) {}

  public async execute(
    input: DeleteProductInput
  ): Promise<Result<DeleteProductOutput, Error>> {
    try {
      const deleteResult = await this.commandService.delete(input.id, input.appId);
      if (deleteResult.isFailure) {
        return Result.error(deleteResult.error!);
      }

      return Result.ok({ success: true });
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }
}







