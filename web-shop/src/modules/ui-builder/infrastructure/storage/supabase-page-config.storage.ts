import { injectable, inject } from 'inversify';
import type { PageConfigStoragePort } from '../../application/ports/page-config-storage.port';
import { Result } from '@/shared/result/result';
import type { PageConfig } from '../../domain/entities/page-config.entity';
import { TYPES as ROOT_TYPES } from '@/infrastructure/bootstrap/types';
import type { DatabaseClientPort } from '@/application/ports/database-client.port';

interface PageConfigRow {
  id: string;
  app_id: string;
  merchant_id: string;
  page_slug: string;
  version: number;
  is_active: boolean;
  is_draft: boolean;
  sections: unknown;
  page_styles?: unknown;
  created_at?: string;
  updated_at?: string;
}

@injectable()
export class SupabasePageConfigStorage implements PageConfigStoragePort {
  constructor(
    @inject(ROOT_TYPES.DatabaseClient) private readonly _db: DatabaseClientPort
  ) {}

  async loadDraft(appId: string, pageSlug: string): Promise<Result<PageConfig | null, Error>> {
    try {
      const { data, error } = await this._db
        .from('page_configs')
        .select('*')
        .eq('app_id', appId)
        .eq('page_slug', pageSlug)
        .eq('is_draft', true)
        .order('version', { ascending: false })
        .limit(1);

      if (error) {
        return Result.fail(new Error(`Failed to load draft: ${error.message}`));
      }

      if (!data || data.length === 0) {
        return Result.ok<PageConfig | null, Error>(null);
      }

      const row = data[0] as PageConfigRow;
      const sections = (row.sections as any[] || []).map((section: any) => ({
        ...section,
        components: section.components || [],
        layout: section.layout || {
          grid: '1-column',
          gap: '1rem',
          align: 'start'
        }
      }));
      
      const pageConfig: PageConfig = {
        id: row.id,
        appId: row.app_id,
        merchantId: row.merchant_id,
        pageSlug: row.page_slug,
        version: row.version,
        isDraft: row.is_draft,
        isActive: row.is_active,
        sections,
        pageStyles: (row.page_styles as { padding?: string; gap?: string; backgroundColor?: string; backgroundOpacity?: number }) || {},
      };

      return Result.ok<PageConfig | null, Error>(pageConfig);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async loadActive(appId: string, pageSlug: string): Promise<Result<PageConfig | null, Error>> {
    try {
      const { data, error } = await this._db
        .from('page_configs')
        .select('*')
        .eq('app_id', appId)
        .eq('page_slug', pageSlug)
        .eq('is_active', true)
        .order('version', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return Result.ok<PageConfig | null, Error>(null);
        }
        return Result.fail(new Error(`Failed to load active config: ${error.message}`));
      }

      if (!data) {
        return Result.ok<PageConfig | null, Error>(null);
      }

      const row = data as PageConfigRow;
      const sections = (row.sections as any[] || []).map((section: any) => ({
        ...section,
        components: section.components || [],
        layout: section.layout || {
          grid: '1-column',
          gap: '1rem',
          align: 'start'
        }
      }));
      
      const pageConfig: PageConfig = {
        id: row.id,
        appId: row.app_id,
        merchantId: row.merchant_id,
        pageSlug: row.page_slug,
        version: row.version,
        isDraft: row.is_draft,
        isActive: row.is_active,
        sections,
        pageStyles: (row.page_styles as { padding?: string; gap?: string; backgroundColor?: string; backgroundOpacity?: number }) || {},
      };

      return Result.ok<PageConfig | null, Error>(pageConfig);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async saveDraft(config: PageConfig): Promise<Result<void, Error>> {
    try {
      const { data: existingDraft } = await this._db
        .from('page_configs')
        .select('id, version')
        .eq('app_id', config.appId)
        .eq('page_slug', config.pageSlug)
        .eq('is_draft', true)
        .order('version', { ascending: false })
        .limit(1);

      const newVersion = existingDraft && Array.isArray(existingDraft) && existingDraft.length > 0
        ? (existingDraft[0].version as number) + 1
        : 1;

      if (existingDraft && Array.isArray(existingDraft) && existingDraft.length > 0) {
        const { error } = await this._db
          .from('page_configs')
          .update({
            version: newVersion,
            sections: config.sections,
            page_styles: config.pageStyles || {},
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingDraft[0].id);

        if (error) {
          return Result.fail(new Error(`Failed to update draft: ${error.message}`));
        }
      } else {
        const { error } = await this._db
          .from('page_configs')
          .insert({
            app_id: config.appId,
            merchant_id: config.merchantId,
            page_slug: config.pageSlug,
            version: newVersion,
            is_active: false,
            is_draft: true,
            sections: config.sections,
            page_styles: config.pageStyles || {},
          });

        if (error) {
          return Result.fail(new Error(`Failed to insert draft: ${error.message}`));
        }
      }

      return Result.ok<void, Error>(undefined as void);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async publish(appId: string, pageSlug: string): Promise<Result<void, Error>> {
    try {
      const draftResult = await this.loadDraft(appId, pageSlug);
      if (!draftResult.isSuccess || !draftResult.value) {
        return Result.fail(new Error('No draft found to publish'));
      }

      const draft = draftResult.value;

      const { error: deactivateError } = await this._db
        .from('page_configs')
        .update({ is_active: false })
        .eq('app_id', appId)
        .eq('page_slug', pageSlug)
        .eq('is_active', true);

      if (deactivateError) {
        return Result.fail(new Error(`Failed to deactivate active configs: ${deactivateError.message}`));
      }

      const { error: activateError } = await this._db
        .from('page_configs')
        .update({ 
          is_active: true, 
          is_draft: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', draft.id);

      if (activateError) {
        return Result.fail(new Error(`Failed to activate draft: ${activateError.message}`));
      }

      return Result.ok<void, Error>(undefined as void);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async listPages(appId: string): Promise<Result<string[], Error>> {
    try {
      const { data, error } = await this._db
        .from('page_configs')
        .select('page_slug')
        .eq('app_id', appId);

      if (error) {
        return Result.fail(new Error(`Failed to list pages: ${error.message}`));
      }

      const pageSlugs: string[] = Array.from(new Set(
        (data || []).map((row: { page_slug: string }) => row.page_slug as string)
      ));

      return Result.ok<string[], Error>(pageSlugs);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}
