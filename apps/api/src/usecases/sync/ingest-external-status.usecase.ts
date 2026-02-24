import { SyncRecordRepo } from '../../modules/sync/repos/sync-record.repo';

const knownStatusMap: Record<string, string> = {
  SYNCED: 'SYNCED',
  IN_PROGRESS: 'IN_PROGRESS',
  READY: 'READY_FOR_PICKUP',
  FULFILLED: 'FULFILLED',
  CANCELED: 'CANCELED',
};

export class IngestExternalStatusUseCase {
  constructor(private readonly syncRecordRepo: SyncRecordRepo) {}

  execute(orderId: string, tenantId: string, rawStatus: string): { internalState: string; rawStatus: string } {
    const internalState = knownStatusMap[rawStatus] ?? 'NEEDS_REVIEW';

    this.syncRecordRepo.add({
      syncRecordId: `sync-in-${Date.now()}`,
      orderId,
      tenantId,
      provider: '1c',
      direction: 'INBOUND_STATUS',
      status: internalState === 'NEEDS_REVIEW' ? 'NEEDS_OPERATOR' : 'SENT',
      attemptCount: 0,
      lastErrorCode: internalState === 'NEEDS_REVIEW' ? 'UNKNOWN_EXTERNAL_STATUS' : undefined,
    });

    return { internalState, rawStatus };
  }
}
