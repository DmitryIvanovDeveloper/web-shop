import { injectable, inject } from 'inversify';
import type { IAsyncEventHandler } from '../events/events-handler.plugin';
import { ProjectSelectedEvent } from '../../modules/merchant-admin/projects/domain';
import type { Logger } from '../../application/ports/logger.port';
import { TYPES } from '../bootstrap/types';

@injectable()
export class ProjectSelectedHandler implements IAsyncEventHandler<ProjectSelectedEvent> {
  constructor(
    @inject(TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  public canHandle(event: ProjectSelectedEvent): boolean {
    return event instanceof ProjectSelectedEvent;
  }

  public async handleAsync(event: ProjectSelectedEvent): Promise<void> {
    this._logger.info('[ProjectSelectedHandler] Handling project selection', {
      merchantId: event.merchantId,
      projectId: event.projectId,
      appId: event.appId
    });

    try {
      // Store selected project in localStorage for persistence
      const selectedProjectData = {
        merchantId: event.merchantId,
        projectId: event.projectId,
        appId: event.appId,
        projectName: event.projectName,
        selectedAt: new Date().toISOString()
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedProject', JSON.stringify(selectedProjectData));

        // Dispatch custom event for UI components to react
        window.dispatchEvent(new CustomEvent('projectSelected', {
          detail: selectedProjectData
        }));

        this._logger.info('[ProjectSelectedHandler] Project selection stored and event dispatched', {
          appId: event.appId
        });
      }
    } catch (error) {
      this._logger.error('[ProjectSelectedHandler] Error handling project selection', error);
    }
  }
}
