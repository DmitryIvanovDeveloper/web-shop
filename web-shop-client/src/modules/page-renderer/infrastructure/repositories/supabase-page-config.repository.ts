import { injectable, inject } from 'inversify';
import { Result } from '../../../../shared/result/result';
import type { PageConfigRepositoryPort } from '../../application/ports/page-config-repository.port';
import type { PageConfig } from '../../domain/entities/page-config.entity';
import type { PageSection } from '../../domain/entities/page-section';
import type { DatabaseClientPort } from '../../../../application/ports/database-client.port';
import type { Logger } from '../../../../application/ports/logger.port';
import { ComponentNode } from '../../../app-layout/domain/value-objects/component-node.value-object';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';


function convertToComponentNode(json: any): ComponentNode | null {
  if (!json || !json.id || !json.type) {
    return null;
  }
  
  const result = ComponentNode.create({
    id: json.id,
    type: json.type,
    props: json.props || {},
    styles: json.styles || {},
    children: (json.children || [])
      .map((node: any) => convertToComponentNode(node))
      .filter((node: ComponentNode | null): node is ComponentNode => node !== null),
    actions: json.actions
  });
  
  if (result.isFailure) {
        return null;
  }
  
  return result.value || null;
}

@injectable()
export class SupabasePageConfigRepository implements PageConfigRepositoryPort {
  constructor(
    @inject(ROOT_TYPES.DatabaseClient) private readonly _db: DatabaseClientPort,
    @inject(ROOT_TYPES.Logger) private readonly _logger: Logger
  ) {}

  async loadByAppIdAndSlug(
    appId: string, 
    pageSlug: string, 
    isDraft: boolean
  ): Promise<Result<PageConfig | null, Error>> {
    this._logger.info('[SupabasePageConfigRepository] Loading', { appId, pageSlug, isDraft });
    
    try {
      const { data, error } = await this._db
        .from('page_configs')
        .select('*')
        .eq('app_id', appId)
        .eq('page_slug', pageSlug)
        .eq(isDraft ? 'is_draft' : 'is_active', true)
        .order('version', { ascending: false })
        .limit(1)
        .single();
      
            if (error && error.code === 'PGRST116') {
        this._logger.info('[SupabasePageConfigRepository] No config found');
        return Result.ok(null);
      }
      
      if (error) {
        this._logger.error('[SupabasePageConfigRepository] Error', error);
        return Result.error(new Error(error.message));
      }
      
            const sections: PageSection[] = (data.sections || []).map((sectionJson: any) => ({
        id: sectionJson.id,
        type: sectionJson.type,
        layout: sectionJson.layout || {
          grid: '1-column',
          gap: '1rem',
          align: 'start'
        },
        styles: sectionJson.styles,
        components: (sectionJson.components || [])
          .map((node: any) => convertToComponentNode(node))
          .filter((node: ComponentNode | null): node is ComponentNode => node !== null)
      }));
      
      const pageConfig: PageConfig = {
        id: data.id,
        appId: data.app_id,
        pageSlug: data.page_slug,
        sections,
        isDraft: data.is_draft,
        isActive: data.is_active,
        version: data.version,
        pageStyles: (data.page_styles as { padding?: string; gap?: string }) || {},
      };
      
      this._logger.info('[SupabasePageConfigRepository] Loaded successfully', {
        sectionsCount: pageConfig.sections.length,
        totalComponents: sections.reduce((sum, s) => sum + s.components.length, 0)
      });
      
      return Result.ok(pageConfig);
    } catch (err) {
      this._logger.error('[SupabasePageConfigRepository] Exception', err);
      return Result.error(err instanceof Error ? err : new Error('Unknown error'));
    }
  }
}
