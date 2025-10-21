import { injectable, inject } from 'inversify';
import { Result } from '../../../../shared/domain/result/result';
import { AuthUIRepositoryPort } from '../ports/auth-ui-repository.port';
import { AuthUIConfigValueObject } from '../../domain/value-objects/auth-ui-config.value-object';
import { AUTH_TYPES } from '../../infrastructure/bootstrap/types';

@injectable()
export class LoadAuthUIConfigUseCase {
  constructor(
    @inject(AUTH_TYPES.AuthUIRepository)
    private readonly _authUIRepository: AuthUIRepositoryPort
  ) {}

  public async execute(): Promise<Result<AuthUIConfigValueObject, Error>> {
    try {
      return await this._authUIRepository.loadAuthUIConfig();
    } catch (error) {
      return Result.error(new Error(`Failed to load auth UI config: ${error}`));
    }
  }
}
