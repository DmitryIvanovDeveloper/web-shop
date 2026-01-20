import type { ConfigValidatorPort, ValidationResult } from '../../application/ports/config-validator.port';

export class JsonSchemaValidator implements ConfigValidatorPort {
  async validate(config: Record<string, unknown>): Promise<ValidationResult> {
    
    return {
      isSuccess: true,
      isFailure: false,
      value: config as Record<string, unknown>
    };
  }
}

