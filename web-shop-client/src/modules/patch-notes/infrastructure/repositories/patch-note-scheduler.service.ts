import { inject, injectable } from 'inversify';
import { Result } from '../../../../shared/result/result';
import { TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';
import type { PatchNoteSchedulerPort } from '../../application/ports/patch-note-scheduler.port';
import type { PatchNoteId } from '../../domain/value-objects/patch-note-id';

@injectable()
export class PatchNoteSchedulerService implements PatchNoteSchedulerPort {
      private readonly scheduledPublications = new Map<string, {
    patchNoteId: string;
    publishDate: Date;
    timeoutId?: NodeJS.Timeout;
  }>();

  constructor(
    @inject(TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  async schedulePublication(patchNoteId: PatchNoteId, publishDate: Date): Promise<Result<void, Error>> {
    try {
      this._logger.info('[PatchNoteSchedulerService] Scheduling publication', {
        patchNoteId: patchNoteId.value,
        publishDate: publishDate.toISOString()
      });

            await this.cancelScheduledPublication(patchNoteId);

            const now = new Date();
      const delay = publishDate.getTime() - now.getTime();

      if (delay <= 0) {
        return Result.error(new Error('Publish date must be in the future'));
      }

            const timeoutId = setTimeout(async () => {
        try {
                              this._logger.info('[PatchNoteSchedulerService] Auto-publishing patch note', {
            patchNoteId: patchNoteId.value
          });

                    this.scheduledPublications.delete(patchNoteId.value);

        } catch (error) {
          this._logger.error('[PatchNoteSchedulerService] Failed to auto-publish patch note', {
            patchNoteId: patchNoteId.value,
            error
          });
        }
      }, delay);

            this.scheduledPublications.set(patchNoteId.value, {
        patchNoteId: patchNoteId.value,
        publishDate,
        timeoutId
      });

      this._logger.info('[PatchNoteSchedulerService] Publication scheduled successfully');
      return Result.ok(undefined);

    } catch (error) {
      this._logger.error('[PatchNoteSchedulerService] Failed to schedule publication', { error });
      return Result.error(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async cancelScheduledPublication(patchNoteId: PatchNoteId): Promise<Result<void, Error>> {
    try {
      const scheduled = this.scheduledPublications.get(patchNoteId.value);

      if (scheduled) {
                if (scheduled.timeoutId) {
          clearTimeout(scheduled.timeoutId);
        }

                this.scheduledPublications.delete(patchNoteId.value);

        this._logger.info('[PatchNoteSchedulerService] Scheduled publication cancelled', {
          patchNoteId: patchNoteId.value
        });
      }

      return Result.ok(undefined);

    } catch (error) {
      this._logger.error('[PatchNoteSchedulerService] Failed to cancel scheduled publication', { error });
      return Result.error(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

    getScheduledPublications(): Array<{ patchNoteId: string; publishDate: Date }> {
    return Array.from(this.scheduledPublications.values()).map(item => ({
      patchNoteId: item.patchNoteId,
      publishDate: item.publishDate
    }));
  }
}
