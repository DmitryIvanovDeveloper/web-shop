import { inject, injectable } from 'inversify';
import { Result } from '@/shared/result/result';
import { TYPES as ROOT_TYPES } from '@/infrastructure/bootstrap/types';
import type { HttpClient } from '@/application/ports/http-client.port';
import type { Template, TemplateSummary } from '../../domain/entities/template.entity';
import type {
  TemplateRepositoryPort,
  TemplateSearchFilter,
  PaginationParams,
} from '../../application/ports/template-repository.port';

interface TemplateDto {
  id: string;
  name: string;
  description: string | null;
  template_data: unknown;
  created_at: string | null;
  updated_at: string | null;
}

interface TemplatesApiResponse {
  templates: TemplateDto[];
}

interface TemplateApiResponse {
  template: TemplateDto;
}

interface CreateTemplateRequest {
  name: string;
  description?: string;
  templateData: unknown;
}

interface UpdateTemplateRequest {
  id: string;
  name?: string;
  description?: string;
  templateData?: unknown;
}

const mapDtoToDomain = (dto: TemplateDto): Result<Template, Error> => {
  try {
    return Result.ok({
      id: dto.id,
      name: dto.name,
      description: dto.description ?? undefined,
      templateData: dto.template_data as any,
      createdAt: dto.created_at ? new Date(dto.created_at) : undefined,
      updatedAt: dto.updated_at ? new Date(dto.updated_at) : undefined,
    });
  } catch (error) {
    return Result.error(
      error instanceof Error ? error : new Error('Failed to map DTO to domain')
    );
  }
};

@injectable()
export class TemplateRepository implements TemplateRepositoryPort {
  public constructor(
    @inject(ROOT_TYPES.HttpClient)
    private readonly httpClient: HttpClient
  ) {}

  public async create(template: Template): Promise<Result<Template, Error>> {
    try {
      const requestData: CreateTemplateRequest = {
        name: template.name,
        description: template.description,
        templateData: template.templateData,
      };

      const response = await this.httpClient.post<TemplateApiResponse>(
        '/api/app-builder/templates',
        requestData
      );

      if (response.status !== 201 && response.status !== 200) {
        return Result.error(
          new Error(`Failed to create template: ${response.statusText}`)
        );
      }

      if (!response.data?.template) {
        return Result.error(new Error('Invalid response format from API'));
      }

      const mappingResult = mapDtoToDomain(response.data.template);
      if (mappingResult.isFailure) {
        return Result.error(mappingResult.error!);
      }

      return Result.ok(mappingResult.value!);
    } catch (error) {
      return Result.error(
        error instanceof Error ? error : new Error('Failed to create template')
      );
    }
  }

  public async update(template: Template): Promise<Result<Template, Error>> {
    try {
      const requestData: UpdateTemplateRequest = {
        id: template.id,
        name: template.name,
        description: template.description,
        templateData: template.templateData,
      };

      const response = await this.httpClient.put<TemplateApiResponse>(
        '/api/app-builder/templates',
        requestData
      );

      if (response.status !== 200) {
        return Result.error(
          new Error(`Failed to update template: ${response.statusText}`)
        );
      }

      if (!response.data?.template) {
        return Result.error(new Error('Invalid response format from API'));
      }

      const mappingResult = mapDtoToDomain(response.data.template);
      if (mappingResult.isFailure) {
        return Result.error(mappingResult.error!);
      }

      return Result.ok(mappingResult.value!);
    } catch (error) {
      return Result.error(
        error instanceof Error ? error : new Error('Failed to update template')
      );
    }
  }

  public async delete(id: string): Promise<Result<void, Error>> {
    try {
      const response = await this.httpClient.delete(
        `/api/app-builder/templates?id=${encodeURIComponent(id)}`
      );

      if (response.status !== 200 && response.status !== 204) {
        return Result.error(
          new Error(`Failed to delete template: ${response.statusText}`)
        );
      }

      return Result.ok<void, Error>(undefined as void);
    } catch (error) {
      return Result.error(
        error instanceof Error ? error : new Error('Failed to delete template')
      );
    }
  }

  public async findById(id: string): Promise<Result<Template | null, Error>> {
    try {
      const response = await this.httpClient.get<TemplateApiResponse>(
        `/api/app-builder/templates/${id}`
      );

      if (response.status === 404) {
        return Result.ok<Template | null, Error>(null);
      }

      if (response.status !== 200) {
        return Result.error(
          new Error(`Failed to load template: ${response.statusText}`)
        );
      }

      if (!response.data?.template) {
        return Result.error(new Error('Invalid response format from API'));
      }

      const mappingResult = mapDtoToDomain(response.data.template);
      if (mappingResult.isFailure) {
        return Result.error(mappingResult.error!);
      }

      return Result.ok<Template | null, Error>(mappingResult.value!);
    } catch (error) {
      return Result.error(
        error instanceof Error ? error : new Error('Failed to find template')
      );
    }
  }

  public async list(
    filter?: TemplateSearchFilter,
    pagination?: PaginationParams
  ): Promise<Result<TemplateSummary[], Error>> {
    try {
      const params = new URLSearchParams();
      
      if (filter?.query) {
        params.set('query', filter.query);
      }
      
      if (pagination) {
        params.set('page', pagination.page.toString());
        params.set('pageSize', pagination.pageSize.toString());
      }

      const url = `/api/app-builder/templates?${params.toString()}`;
      const response = await this.httpClient.get<TemplatesApiResponse>(url);

      if (response.status !== 200) {
        return Result.error(
          new Error(`Failed to fetch templates: ${response.statusText}`)
        );
      }

      const templates = response.data?.templates ?? [];

      const summaries: TemplateSummary[] = templates.map((dto) => ({
        id: dto.id,
        name: dto.name,
        description: dto.description ?? undefined,
        updatedAt: dto.updated_at
          ? new Date(dto.updated_at)
          : dto.created_at
          ? new Date(dto.created_at)
          : undefined,
      }));

      return Result.ok(summaries);
    } catch (error) {
      return Result.error(
        error instanceof Error ? error : new Error('Failed to list templates')
      );
    }
  }
}
