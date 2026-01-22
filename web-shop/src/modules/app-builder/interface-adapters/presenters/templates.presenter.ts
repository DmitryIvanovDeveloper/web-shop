import { inject, injectable } from 'inversify';
import { Result } from '@/shared/result/result';
import { APP_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
import type { Template, TemplateSummary } from '../../domain/entities/template.entity';
import type { PaginationParams } from '../../application/ports/template-repository.port';
import type { ListTemplatesUseCase } from '../../application/use-cases/list-templates.use-case';
import type { GetTemplateDetailsUseCase } from '../../application/use-cases/get-template-details.use-case';

export interface TemplatesViewModel {
  templates: TemplateSummary[];
  selectedTemplateId: string | null;
  selectedTemplate: Template | null;
  isLoadingList: boolean;
  isLoadingDetails: boolean;
  error: string | null;
  query: string;
  pagination: PaginationParams | null;
}

@injectable()
export class TemplatesPresenter {
  private readonly subscribers: Array<(vm: TemplatesViewModel) => void> = [];

  private vm: TemplatesViewModel = {
    templates: [],
    selectedTemplateId: null,
    selectedTemplate: null,
    isLoadingList: false,
    isLoadingDetails: false,
    error: null,
    query: '',
    pagination: null,
  };

  constructor(
    @inject(APP_BUILDER_TYPES.ListTemplatesUseCase)
    private readonly listTemplatesUseCase: ListTemplatesUseCase,
    @inject(APP_BUILDER_TYPES.GetTemplateDetailsUseCase)
    private readonly getTemplateDetailsUseCase: GetTemplateDetailsUseCase
  ) {}

  public subscribe(cb: (vm: TemplatesViewModel) => void): () => void {
    this.subscribers.push(cb);
    cb(this.vm);
    return () => {
      const idx = this.subscribers.indexOf(cb);
      if (idx >= 0) this.subscribers.splice(idx, 1);
    };
  }

  private notify(): void {
    for (const cb of this.subscribers) cb(this.vm);
  }

  public getViewModel(): TemplatesViewModel {
    return this.vm;
  }

  public async loadTemplates(query?: string): Promise<Result<void, Error>> {
    this.vm = {
      ...this.vm,
      isLoadingList: true,
      error: null,
      query: query ?? this.vm.query,
    };
    this.notify();

    const result = await this.listTemplatesUseCase.execute({
      query: query ?? this.vm.query,
      pagination: this.vm.pagination ?? undefined,
    });

    if (result.isFailure) {
      this.vm = {
        ...this.vm,
        isLoadingList: false,
        error: result.error?.message ?? 'Failed to load templates',
      };
      this.notify();
      return Result.error(result.error ?? new Error('Failed to load templates'));
    }

    this.vm = {
      ...this.vm,
      isLoadingList: false,
      templates: result.value ?? [],
    };
    this.notify();

    return Result.ok<void, Error>(undefined as void);
  }

  public async selectTemplate(id: string | null): Promise<void> {
    if (!id) {
      this.vm = {
        ...this.vm,
        selectedTemplateId: null,
        selectedTemplate: null,
        isLoadingDetails: false,
        error: null,
      };
      this.notify();
      return;
    }

    this.vm = {
      ...this.vm,
      selectedTemplateId: id,
      isLoadingDetails: true,
      error: null,
    };
    this.notify();

    const result = await this.getTemplateDetailsUseCase.execute({ id });

    if (result.isFailure) {
      this.vm = {
        ...this.vm,
        isLoadingDetails: false,
        selectedTemplate: null,
        error: result.error?.message ?? 'Failed to load template details',
      };
      this.notify();
      return;
    }

    this.vm = {
      ...this.vm,
      isLoadingDetails: false,
      selectedTemplate: result.value ?? null,
    };
    this.notify();
  }

  public clearSelection(): void {
    this.vm = {
      ...this.vm,
      selectedTemplateId: null,
      selectedTemplate: null,
    };
    this.notify();
  }
}
