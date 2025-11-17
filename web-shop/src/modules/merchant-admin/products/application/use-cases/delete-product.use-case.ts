import { inject, injectable } from 'inversify';
import { Result } from '../../../../../shared/domain/result/result';
import type { ProductQueryServicePort } from '../ports/product-query-service.port';
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
    @inject(PRODUCT_TYPES.ProductQueryService)
    private readonly queryService: ProductQueryServicePort,
    @inject(PRODUCT_TYPES.ProductCommandService)
    private readonly commandService: ProductCommandServicePort
  ) {}

  public async execute(
    input: DeleteProductInput
  ): Promise<Result<DeleteProductOutput, Error>> {
    // Validate product exists via port
    const loadResult = await this.queryService.loadById(input.id, input.appId);
    if (loadResult.isFailure()) {
      return Result.error(loadResult.error!);
    }

    // Delete via port
    const deleteResult = await this.commandService.delete(input.id, input.appId);
    if (deleteResult.isFailure()) {
      return Result.error(deleteResult.error!);
    }

    return Result.ok({ success: true });
  }
}

