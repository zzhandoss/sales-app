import { PushOrderToErpUseCase } from '../../usecases/sync/push-order-to-erp.usecase';
import { SyncRecordRepo } from '../../modules/sync/repos/sync-record.repo';

export class SyncRetryWorker {
  constructor(
    private readonly syncRecordRepo: SyncRecordRepo,
    private readonly pushOrderToErpUseCase: PushOrderToErpUseCase,
  ) {}

  async run(now = new Date().toISOString()): Promise<number> {
    const retryableRecords = await this.syncRecordRepo.findPendingForRetry(now);
    let processed = 0;

    for (const record of retryableRecords) {
      if (record.direction !== 'OUTBOUND_ORDER') {
        continue;
      }

      await this.pushOrderToErpUseCase.execute(record);
      processed += 1;
    }

    return processed;
  }
}
