import { Result } from '../../../../../shared/result/result';
import type { Project, ProjectId, AppId, MerchantId } from '../../domain';

export interface ProjectRepositoryPort {
  
  findById(id: ProjectId): Promise<Result<Project, Error>>;
  findByAppId(appId: AppId): Promise<Result<Project, Error>>;
  findByMerchantId(merchantId: MerchantId): Promise<Result<Project[], Error>>;
  findActiveByMerchantId(merchantId: MerchantId): Promise<Result<Project | null, Error>>;
  save(project: Project): Promise<Result<Project, Error>>;
  update(id: ProjectId, updates: Partial<{
    name: string;
    description: string;
    status: string;
  }>): Promise<Result<Project, Error>>;
  delete(id: ProjectId): Promise<Result<void, Error>>;

  existsByAppId(appId: AppId): Promise<Result<boolean, Error>>;
  existsById(id: ProjectId): Promise<Result<boolean, Error>>;
}