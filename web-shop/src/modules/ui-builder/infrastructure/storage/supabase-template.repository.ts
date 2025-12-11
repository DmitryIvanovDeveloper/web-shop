import { inject, injectable } from 'inversify';
import { Result } from '@/shared/result/result';
import type { Logger } from '@/application/ports/logger.port';
import type { DatabaseClientPort } from '@/application/ports/database-client.port';
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

      const { data, error } = await this.db
        .from('templates')
        .insert(row)
        .select('*')
        .single();

      if (error) {
        this.logger.error('[SupabaseTemplateRepository] Failed to insert template', { error });
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
    });

    try {
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

      return Result.ok<TemplateSummary[], Error>(summaries);
    } catch (error) {
      this.logger.error('[SupabaseTemplateRepository] Unexpected error on list', { error });
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


