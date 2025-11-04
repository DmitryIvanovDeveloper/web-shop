import { injectable, inject } from 'inversify';
import type { PageConfigStoragePort } from '../../application/ports/page-config-storage.port';
import { Result } from '@/shared/result/result';
import type { PageConfig } from '../../domain/entities/page-config.entity';
import type { Logger } from '@/application/ports/logger.port';
import { TYPES as ROOT_TYPES } from '@/infrastructure/bootstrap/types';
import type { DatabaseClientPort } from '@/application/ports/database-client.port';

interface PageConfigRow {
  id: string;
  app_id: string;
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
    @inject(ROOT_TYPES.Logger) private readonly _logger: Logger,
    @inject(ROOT_TYPES.DatabaseClient) private readonly _db: DatabaseClientPort
  ) {}

  async loadDraft(appId: string, pageSlug: string): Promise<Result<PageConfig | null, Error>> {
    this._logger.info('[SupabasePageConfigStorage] Loading draft page config', { appId, pageSlug });

    try {
      const { data, error } = await this._db
        .from('page_configs')
        .select('*')
        .eq('app_id', appId)
        .eq('page_slug', pageSlug)
        .eq('is_draft', true)
        .order('version', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          this._logger.info('[SupabasePageConfigStorage] No draft found', { appId, pageSlug });
          return Result.ok<PageConfig | null, Error>(null);
        }
        this._logger.error('[SupabasePageConfigStorage] Error loading draft', error);
        return Result.fail(new Error(`Failed to load draft: ${error.message}`));
      }

      if (!data) {
        return Result.ok<PageConfig | null, Error>(null);
      }

      const row = data as PageConfigRow;
      const pageConfig: PageConfig = {
        id: row.id,
        appId: row.app_id,
        pageSlug: row.page_slug,
        version: row.version,
        isDraft: row.is_draft,
        isActive: row.is_active,
        sections: row.sections as any[] || [],
        pageStyles: (row.page_styles as { padding?: string }) || {},
      };

      this._logger.info('[SupabasePageConfigStorage] Draft loaded successfully', { appId, pageSlug, version: pageConfig.version });
      return Result.ok<PageConfig | null, Error>(pageConfig);
    } catch (error) {
      this._logger.error('[SupabasePageConfigStorage] Error loading draft', error);
      return Result.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async loadActive(appId: string, pageSlug: string): Promise<Result<PageConfig | null, Error>> {
    this._logger.info('[SupabasePageConfigStorage] Loading active page config', { appId, pageSlug });

    try {
      const { data, error } = await this._db
        .from('page_configs')
        .select('*')
        .eq('app_id', appId)
        .eq('page_slug', pageSlug)
        .eq('is_active', true)
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          this._logger.info('[SupabasePageConfigStorage] No active config found', { appId, pageSlug });
          return Result.ok<PageConfig | null, Error>(null);
        }
        this._logger.error('[SupabasePageConfigStorage] Error loading active config', error);
        return Result.fail(new Error(`Failed to load active config: ${error.message}`));
      }

      if (!data) {
        return Result.ok<PageConfig | null, Error>(null);
      }

      const row = data as PageConfigRow;
      const pageConfig: PageConfig = {
        id: row.id,
        appId: row.app_id,
        pageSlug: row.page_slug,
        version: row.version,
        isDraft: row.is_draft,
        isActive: row.is_active,
        sections: row.sections as any[] || [],
        pageStyles: (row.page_styles as { padding?: string }) || {},
      };

      this._logger.info('[SupabasePageConfigStorage] Active config loaded successfully', { appId, pageSlug, version: pageConfig.version });
      return Result.ok<PageConfig | null, Error>(pageConfig);
    } catch (error) {
      this._logger.error('[SupabasePageConfigStorage] Error loading active config', error);
      return Result.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async saveDraft(config: PageConfig): Promise<Result<void, Error>> {
    this._logger.info('[SupabasePageConfigStorage] Saving draft page config', { 
      appId: config.appId, 
      pageSlug: config.pageSlug,
      version: config.version 
    });

    try {
      // Check if draft already exists
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
        // Update existing draft
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
          this._logger.error('[SupabasePageConfigStorage] Failed to update draft', error);
          return Result.fail(new Error(`Failed to update draft: ${error.message}`));
        }

        this._logger.info('[SupabasePageConfigStorage] Draft updated successfully', { 
          appId: config.appId, 
          pageSlug: config.pageSlug,
          version: newVersion 
        });
      } else {
        // Insert new draft
        const { error } = await this._db
          .from('page_configs')
          .insert({
            app_id: config.appId,
            page_slug: config.pageSlug,
            version: newVersion,
            is_active: false,
            is_draft: true,
            sections: config.sections,
            page_styles: config.pageStyles || {},
          });

        if (error) {
          this._logger.error('[SupabasePageConfigStorage] Failed to insert draft', error);
          return Result.fail(new Error(`Failed to insert draft: ${error.message}`));
        }

        this._logger.info('[SupabasePageConfigStorage] Draft created successfully', { 
          appId: config.appId, 
          pageSlug: config.pageSlug,
          version: newVersion 
        });
      }

      return Result.ok<void, Error>(undefined as void);
    } catch (error) {
      this._logger.error('[SupabasePageConfigStorage] Error saving draft', error);
      return Result.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async publish(appId: string, pageSlug: string): Promise<Result<void, Error>> {
    this._logger.info('[SupabasePageConfigStorage] Publishing page config', { appId, pageSlug });

    try {
      // Load current draft
      const draftResult = await this.loadDraft(appId, pageSlug);
      if (!draftResult.isSuccess || !draftResult.value) {
        return Result.fail(new Error('No draft found to publish'));
      }

      const draft = draftResult.value;

      // Deactivate current active version if exists
      await this._db
        .from('page_configs')
        .update({ is_active: false })
        .eq('app_id', appId)
        .eq('page_slug', pageSlug)
        .eq('is_active', true);

      // Create new active version from draft
      const { error: insertError } = await this._db
        .from('page_configs')
        .insert({
          app_id: appId,
          page_slug: pageSlug,
          version: draft.version,
          is_active: true,
          is_draft: false,
          sections: draft.sections,
          page_styles: draft.pageStyles || {},
        });

      if (insertError) {
        this._logger.error('[SupabasePageConfigStorage] Failed to publish', insertError);
        return Result.fail(new Error(`Failed to publish: ${insertError.message}`));
      }

      this._logger.info('[SupabasePageConfigStorage] Page config published successfully', { 
        appId, 
        pageSlug,
        version: draft.version 
      });
      return Result.ok<void, Error>(undefined as void);
    } catch (error) {
      this._logger.error('[SupabasePageConfigStorage] Error publishing', error);
      return Result.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}

