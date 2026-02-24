import { SyncRecordRepo } from '../../modules/sync/repos/sync-record.repo';

export class ListDeadLetterUseCase {
  constructor(private readonly syncRecordRepo: SyncRecordRepo) {}

  async execute(tenantId: string) {
    return this.syncRecordRepo.findNeedsOperator(tenantId);
  }
}
