export type SyncRecordStatus = 'PENDING' | 'SENT' | 'FAILED' | 'NEEDS_OPERATOR';
export type SyncDirection = 'OUTBOUND_ORDER' | 'INBOUND_STATUS';

export interface SyncRecord {
  syncRecordId: string;
  orderId: string;
  tenantId: string;
  provider: string;
  direction: SyncDirection;
  status: SyncRecordStatus;
  attemptCount: number;
  payload: Record<string, unknown>;
  lastErrorCode?: string;
  nextRetryAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSyncRecordInput {
  syncRecordId: string;
  orderId: string;
  tenantId: string;
  provider: string;
  direction: SyncDirection;
  payload: Record<string, unknown>;
  status?: SyncRecordStatus;
  attemptCount?: number;
  lastErrorCode?: string;
  nextRetryAt?: string;
}

export interface SyncRecordRepo {
  add(record: CreateSyncRecordInput): Promise<SyncRecord>;
  findPendingForRetry(now: string): Promise<SyncRecord[]>;
  findNeedsOperator(tenantId: string): Promise<SyncRecord[]>;
  requeue(syncRecordId: string): Promise<void>;
  markSent(syncRecordId: string): Promise<void>;
  markFailed(syncRecordId: string, errorCode: string, nextRetryAt: string): Promise<void>;
  markNeedsOperator(syncRecordId: string, errorCode: string): Promise<void>;
}
