import { inject, injectable } from 'inversify';
import type { ConfigValidatorPort } from '../ports/config-validator.port';
import { UI_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';

@injectable()
export class ValidateConfigUseCase {
  constructor(
    @inject(UI_BUILDER_TYPES.ConfigValidator)
    private readonly _validator: ConfigValidatorPort
  ) {}

  public async execute(config: Record<string, unknown>) {
    return this._validator.validate(config);
  }
}












