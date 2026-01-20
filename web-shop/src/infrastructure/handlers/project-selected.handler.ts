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
        try {
      
      const selectedProjectData = {
        merchantId: event.merchantId,
        projectId: event.projectId,
        appId: event.appId,
        projectName: event.projectName,
        selectedAt: new Date().toISOString()
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedProject', JSON.stringify(selectedProjectData));

        window.dispatchEvent(new CustomEvent('projectSelected', {
          detail: selectedProjectData
        }));

              }
    } catch (error) {
          }
  }
}
