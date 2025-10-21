import { Result } from '../../../../shared/domain/result/result';
import { AuthUIConfigValueObject } from '../../domain/value-objects/auth-ui-config.value-object';

export interface AuthUIRepositoryPort {
  loadAuthUIConfig(): Promise<Result<AuthUIConfigValueObject, Error>>;
}
