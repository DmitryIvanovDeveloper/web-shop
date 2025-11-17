export interface ValidationIssue {
  path: string;
  message: string;
}

export interface ValidationResult {
  isSuccess: boolean;
  isFailure: boolean;
  value?: Record<string, unknown>;
  error?: ValidationIssue[];
}

export interface ConfigValidatorPort {
  validate(config: Record<string, unknown>): Promise<ValidationResult>;
}


















