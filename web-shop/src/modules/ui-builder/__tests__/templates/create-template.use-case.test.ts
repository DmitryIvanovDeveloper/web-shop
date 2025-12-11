import 'reflect-metadata';
import { Result } from '@/shared/result/result';
import type { TemplateRepositoryPort, TemplateSummary } from '../../application/ports/template-repository.port';
import { CreateTemplateUseCase } from '../../application/use-cases/create-template.use-case';
import { TemplateNameAlreadyExistsError, TemplateValidationError } from '../../domain/errors/template.error';

class InMemoryTemplateRepository implements TemplateRepositoryPort {
  public templates: any[] = [];

  async create(template: any): Promise<Result<any, Error>> {
    this.templates.push(template);
    return Result.ok(template);
  }

  async update(template: any): Promise<Result<any, Error>> {
    const idx = this.templates.findIndex(t => t.id === template.id);
    if (idx >= 0) {
      this.templates[idx] = template;
    }
    return Result.ok(template);
  }

  async delete(): Promise<Result<void, Error>> {
    return Result.ok<void, Error>(undefined as void);
  }

  async findById(): Promise<Result<any | null, Error>> {
    return Result.ok<any | null, Error>(null);
  }

  async findByName(name: string): Promise<Result<any | null, Error>> {
    const found = this.templates.find(t => t.name === name) ?? null;
    return Result.ok<any | null, Error>(found);
  }

  async list(): Promise<Result<TemplateSummary[], Error>> {
    return Result.ok<TemplateSummary[], Error>([]);
  }
}

const createLogger = () =>
  ({
    info: () => undefined,
    warn: () => undefined,
    error: () => undefined,
  } as any);

describe('CreateTemplateUseCase', () => {
  it('creates template when input is valid and name is unique', async () => {
    const repo = new InMemoryTemplateRepository();
    const useCase = new CreateTemplateUseCase(repo as any, createLogger());

    const result = await useCase.execute({
      name: 'My Template',
      appConfig: { foo: 'bar' },
      pages: [{ pageSlug: 'home', pageConfig: { sections: [] } }],
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value).toBeDefined();
    expect(result.value?.name).toBe('My Template');
    expect(repo.templates).toHaveLength(1);
  });

  it('fails when name already exists', async () => {
    const repo = new InMemoryTemplateRepository();
    repo.templates.push({ id: 't1', name: 'Existing', appConfig: {}, pages: [], isActive: true });
    const useCase = new CreateTemplateUseCase(repo as any, createLogger());

    const result = await useCase.execute({
      name: 'Existing',
      appConfig: { foo: 'bar' },
      pages: [{ pageSlug: 'home', pageConfig: { sections: [] } }],
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(TemplateNameAlreadyExistsError);
  });

  it('fails when required fields are missing', async () => {
    const repo = new InMemoryTemplateRepository();
    const useCase = new CreateTemplateUseCase(repo as any, createLogger());

    const result = await useCase.execute({
      name: '',
      // appConfig missing
      // pages missing
      appConfig: undefined as any,
      pages: [] as any,
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(TemplateValidationError);
  });
});

