import { inject, injectable } from 'inversify';
import { Result } from '@/shared/result/result';
import { UI_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
import type { TemplateGrape, TemplateGrapeSummary } from '../../domain/entities/template-grape.entity';
import type { PaginationParams } from '../../application/ports/template-grape-repository.port';
import type { ListTemplatesGrapeUseCase } from '../../application/use-cases/list-templates-grape.use-case';
import type { GetTemplateGrapeDetailsUseCase } from '../../application/use-cases/get-template-grape-details.use-case';

export interface TemplatesGrapeViewModel {
  templates: TemplateGrapeSummary[];
  selectedTemplateId: string | null;
  selectedTemplate: TemplateGrape | null;
  isLoadingList: boolean;
  isLoadingDetails: boolean;
  error: string | null;
  query: string;
  pagination: PaginationParams | null;
}

@injectable()
export class TemplatesGrapePresenter {
  private readonly subscribers: Array<(vm: TemplatesGrapeViewModel) => void> = [];

  private vm: TemplatesGrapeViewModel = {
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
    @inject(UI_BUILDER_TYPES.ListTemplatesGrapeUseCase)
    private readonly listTemplatesGrapeUseCase: ListTemplatesGrapeUseCase,
    @inject(UI_BUILDER_TYPES.GetTemplateGrapeDetailsUseCase)
    private readonly getTemplateGrapeDetailsUseCase: GetTemplateGrapeDetailsUseCase
  ) {}

  public subscribe(cb: (vm: TemplatesGrapeViewModel) => void): () => void {
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

  public getViewModel(): TemplatesGrapeViewModel {
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

    const result = await this.listTemplatesGrapeUseCase.execute({
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

    const result = await this.getTemplateGrapeDetailsUseCase.execute({ id });

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
