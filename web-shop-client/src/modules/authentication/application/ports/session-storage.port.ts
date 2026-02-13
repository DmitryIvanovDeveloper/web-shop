

import { Result } from '../../../../shared/result/result';
import { AppUser } from '../../domain/types';

export interface SessionStoragePort {
  
  save(user: AppUser): Promise<Result<void, Error>>;

  
  load(): Promise<Result<AppUser | null, Error>>;

  
  clear(): Promise<Result<void, Error>>;
}


