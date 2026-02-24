import { SyncRecordRepo } from '../../modules/sync/repos/sync-record.repo';

export class RetryDeadLetterUseCase {
  constructor(private readonly syncRecordRepo: SyncRecordRepo) {}

  async execute(syncRecordId: string): Promise<void> {
    await this.syncRecordRepo.requeue(syncRecordId);
  }
}
