export type SyncRecordStatus = 'PENDING' | 'SENT' | 'FAILED' | 'NEEDS_OPERATOR';

export interface SyncRecord {
  syncRecordId: string;
  orderId: string;
  tenantId: string;
  provider: string;
  direction: 'OUTBOUND_ORDER' | 'INBOUND_STATUS';
  status: SyncRecordStatus;
  attemptCount: number;
  lastErrorCode?: string;
  nextRetryAt?: string;
}

const records: SyncRecord[] = [];

export class SyncRecordRepo {
  add(record: SyncRecord): void {
    records.push(record);
  }

  findPending(): SyncRecord[] {
    return records.filter((record) => record.status === 'PENDING' || record.status === 'FAILED');
  }

  updateStatus(syncRecordId: string, status: SyncRecordStatus): void {
    const target = records.find((record) => record.syncRecordId === syncRecordId);
    if (target) {
      target.status = status;
      target.attemptCount += 1;
    }
  }
}
