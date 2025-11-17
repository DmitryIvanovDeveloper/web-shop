import type { ComparableValue } from '../../domain/types';

export interface ConditionReaderPort {
  read(propertyPath: string, appId?: string, userId?: string): Promise<ComparableValue>;
}
