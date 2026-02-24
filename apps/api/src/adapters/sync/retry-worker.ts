import { SyncRecordRepo } from '../../modules/sync/repos/sync-record.repo';

export class SyncRetryWorker {
  constructor(private readonly syncRecordRepo: SyncRecordRepo) {}

  run(): number {
    const pending = this.syncRecordRepo.findPending();
    for (const record of pending) {
      this.syncRecordRepo.updateStatus(record.syncRecordId, 'SENT');
    }
    return pending.length;
  }
}
