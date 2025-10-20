import type { ComparableValue } from '../../domain/types';

export interface ConditionReaderPort {
  read(propertyPath: string): Promise<ComparableValue>;
}
