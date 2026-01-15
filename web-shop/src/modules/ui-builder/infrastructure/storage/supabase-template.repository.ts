import { inject, injectable } from 'inversify';
import { Result } from '@/shared/result/result';
import type { Logger } from '@/application/ports/logger.port';
import type { HttpClientPort } from '@/application/ports/http-client.port';
import { TYPES as ROOT_TYPES } from '@/infrastructure/bootstrap/types';
import type { Template, TemplatePageSnapshot, TemplateMetadata } from '../../domain/entities/template.entity';
import type {
  TemplateRepositoryPort,
  TemplateSearchFilter,
  TemplateSummary,
  PaginationParams,
} from '../../application/ports/template-repository.port';

interface TemplateRow {
  id: string;
  name: string;
  app_config: unknown;
  page_configs: TemplatePageSnapshot[] | null;
  metadata: TemplateMetadata | null;
  is_active: boolean;
  published?: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

@injectable()
export class SupabaseTemplateRepository implements TemplateRepositoryPort {
  public constructor(
    @inject(ROOT_TYPES.Logger)
    private readonly logger: Logger,
    @inject(ROOT_TYPES.DatabaseClient)
    private readonly db: DatabaseClientPort
  ) {}

  // For client-side usage - check if we're in browser
  private get isClient(): boolean {
    return typeof window !== 'undefined';
  }

  public async create(template: Template): Promise<Result<Template, Error>> {
    this.logger.info('[SupabaseTemplateRepository] Creating template', {
      id: template.id,
      name: template.name,
    });

    try {
      const nowIso = new Date().toISOString();
      const row = this.mapEntityToRow({
        ...template,
        createdAt: template.createdAt ?? new Date(nowIso),
        updatedAt: template.updatedAt ?? new Date(nowIso),
      });

      this.logger.info('[SupabaseTemplateRepository] Mapped row data', {
        id: row.id,
        name: row.name,
        app_config_type: typeof row.app_config,
        page_configs_type: typeof row.page_configs,
        page_configs_length: Array.isArray(row.page_configs) ? row.page_configs.length : 'not_array',
        metadata_type: typeof row.metadata,
        is_active: row.is_active,
        published: row.published,
        created_at: row.created_at,
        updated_at: row.updated_at,
      });

      // Try to serialize the row data to check for circular references
      try {
        const serialized = JSON.stringify(row);
        this.logger.info('[SupabaseTemplateRepository] Row data serialized successfully', {
          size: serialized.length,
        });
      } catch (serializeError) {
        this.logger.error('[SupabaseTemplateRepository] Failed to serialize row data', {
          error: serializeError,
          app_config_keys: Object.keys(row.app_config || {}),
          page_configs_sample: Array.isArray(row.page_configs) && row.page_configs.length > 0
            ? { pageSlug: row.page_configs[0].pageSlug, pageConfig_keys: Object.keys(row.page_configs[0].pageConfig || {}) }
            : 'no_page_configs'
        });
        return Result.error(new Error(`Failed to serialize template data: ${serializeError instanceof Error ? serializeError.message : 'Unknown serialization error'}`));
      }

      const { data, error } = await this.db
        .from('templates')
        .insert(row)
        .select('*')
        .single();

      if (error) {
        this.logger.error('[SupabaseTemplateRepository] Failed to insert template', {
          error,
          error_message: error.message,
          error_details: error.details,
          error_hint: error.hint,
          error_code: error.code,
        });
        return Result.error(new Error(`Failed to create template: ${error.message}`));
      }

      const entity = this.mapRowToEntity(data as TemplateRow);
      return Result.ok(entity);
    } catch (error) {
      this.logger.error('[SupabaseTemplateRepository] Unexpected error on create', { error });
      return Result.error(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  public async update(template: Template): Promise<Result<Template, Error>> {
    this.logger.info('[SupabaseTemplateRepository] Updating template', {
      id: template.id,
      name: template.name,
    });

    try {
      const row = this.mapEntityToRow({
        ...template,
        updatedAt: template.updatedAt ?? new Date(),
      });

      const { data, error } = await this.db
        .from('templates')
        .update(row)
        .eq('id', template.id)
        .select('*')
        .single();

      if (error) {
        this.logger.error('[SupabaseTemplateRepository] Failed to update template', { error });
        return Result.error(new Error(`Failed to update template: ${error.message}`));
      }

      const entity = this.mapRowToEntity(data as TemplateRow);
      return Result.ok(entity);
    } catch (error) {
      this.logger.error('[SupabaseTemplateRepository] Unexpected error on update', { error });
      return Result.error(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  public async delete(id: string): Promise<Result<void, Error>> {
    this.logger.info('[SupabaseTemplateRepository] Deleting template', { id });

    try {
      const { error } = await this.db.from('templates').delete().eq('id', id);

      if (error) {
        this.logger.error('[SupabaseTemplateRepository] Failed to delete template', { error, id });
        return Result.error(new Error(`Failed to delete template: ${error.message}`));
      }

      return Result.ok<void, Error>(undefined as void);
    } catch (error) {
      this.logger.error('[SupabaseTemplateRepository] Unexpected error on delete', { error, id });
      return Result.error(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  public async findById(id: string): Promise<Result<Template | null, Error>> {
    this.logger.info('[SupabaseTemplateRepository] Finding template by id', { id });

    try {
      const { data, error } = await this.db
        .from('templates')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        this.logger.error('[SupabaseTemplateRepository] Failed to load template by id', {
          error,
          id,
        });
        return Result.error(new Error(`Failed to load template: ${error.message}`));
      }

      if (!data) {
        return Result.ok<Template | null, Error>(null);
      }

      const entity = this.mapRowToEntity(data as TemplateRow);
      return Result.ok<Template | null, Error>(entity);
    } catch (error) {
      this.logger.error('[SupabaseTemplateRepository] Unexpected error on findById', {
        error,
        id,
      });
      return Result.error(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  public async findByName(name: string): Promise<Result<Template | null, Error>> {
    const normalized = name.trim();
    this.logger.info('[SupabaseTemplateRepository] Finding template by name', {
      name: normalized,
    });

    try {
      const { data, error } = await this.db
        .from('templates')
        .select('*')
        .eq('name', normalized)
        .maybeSingle();

      if (error) {
        this.logger.error('[SupabaseTemplateRepository] Failed to load template by name', {
          error,
          name: normalized,
        });
        return Result.error(new Error(`Failed to load template: ${error.message}`));
      }

      if (!data) {
        return Result.ok<Template | null, Error>(null);
      }

      const entity = this.mapRowToEntity(data as TemplateRow);
      return Result.ok<Template | null, Error>(entity);
    } catch (error) {
      this.logger.error('[SupabaseTemplateRepository] Unexpected error on findByName', {
        error,
        name: normalized,
      });
      return Result.error(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  public async list(
    filter?: TemplateSearchFilter,
    pagination?: PaginationParams
  ): Promise<Result<TemplateSummary[], Error>> {
    this.logger.info('[SupabaseTemplateRepository] Listing templates', {
      query: filter?.query,
      pagination,
      isClient: this.isClient,
    });

    try {
      // Use HTTP API in browser, direct Supabase on server
      if (this.isClient) {
        this.logger.info('[SupabaseTemplateRepository] Using HTTP API for client-side request');

        const params = new URLSearchParams();
        if (filter?.query) {
          params.set('query', filter.query);
        }

        const response = await fetch(`/api/templates?${params.toString()}`);
        if (!response.ok) {
          const errorText = await response.text();
          this.logger.error('[SupabaseTemplateRepository] HTTP API error', {
            status: response.status,
            error: errorText
          });
          return Result.error(new Error(`Failed to fetch templates: ${response.status} ${errorText}`));
        }

        const data = await response.json();
        const templates = data.templates || [];

        const summaries: TemplateSummary[] = templates.map((template: any) => ({
          id: template.id,
          name: template.name,
          description: template.metadata?.description,
          thumbnailUrl: template.metadata?.previewImageUrl,
          updatedAt: template.updated_at ? new Date(template.updated_at) : new Date(template.created_at),
        }));

        this.logger.info('[SupabaseTemplateRepository] Templates fetched via HTTP API', {
          count: summaries.length,
        });

        return Result.ok(summaries);
      } else {
        // Server-side: use direct Supabase
        let query = this.db
          .from('templates')
          .select('id, name, metadata, updated_at')
          .order('updated_at', { ascending: false });

        if (filter?.query) {
          const q = `%${filter.query.trim()}%`;
          query = query.ilike('name', q);
        }

        if (pagination) {
          const from = (pagination.page - 1) * pagination.pageSize;
          const to = from + pagination.pageSize - 1;
          query = query.range(from, to);
        }

        const { data, error } = await query;

        if (error) {
          this.logger.error('[SupabaseTemplateRepository] Failed to list templates', { error });
          return Result.error(new Error(`Failed to list templates: ${error.message}`));
        }

        const rows = (data as TemplateRow[] | null) ?? [];
        const summaries: TemplateSummary[] = rows.map(row => {
          const metadata = (row.metadata ?? {}) as TemplateMetadata;
          return {
            id: row.id,
            name: row.name,
            description: metadata.description,
            thumbnailUrl: metadata.previewImageUrl,
            updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
          };
        });

        this.logger.info('[SupabaseTemplateRepository] Templates listed successfully', {
          count: summaries.length,
        });

        return Result.ok(summaries);
      }
    } catch (error) {
      this.logger.error('[SupabaseTemplateRepository] Unexpected error', { error });
      return Result.error(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  private mapRowToEntity(row: TemplateRow): Template {
    const metadata = (row.metadata ?? {}) as TemplateMetadata;

    return {
      id: row.id,
      name: row.name,
      appConfig: row.app_config,
      pages: (row.page_configs ?? []) as TemplatePageSnapshot[],
      metadata,
      isActive: row.is_active,
      published: row.published ?? row.is_active ?? false,
      createdAt: row.created_at ? new Date(row.created_at) : undefined,
      updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
    };
  }

  private mapEntityToRow(template: Template): TemplateRow {
    const createdAtIso = template.createdAt?.toISOString() ?? new Date().toISOString();
    const updatedAtIso = template.updatedAt?.toISOString() ?? createdAtIso;

    return {
      id: template.id,
      name: template.name,
      app_config: template.appConfig,
      page_configs: template.pages,
      metadata: (template.metadata ?? {}) as TemplateMetadata,
      is_active: template.isActive,
      published: template.published ?? template.isActive,
      created_at: createdAtIso,
      updated_at: updatedAtIso,
    };
  }
}


