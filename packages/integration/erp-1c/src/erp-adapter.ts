export interface PushOrderPayloadLine {
  productExternalId: string;
  qty: number;
  unitPrice: number;
}

export interface PushOrderPayload {
  tenantExternalId: string;
  internalOrderId: string;
  clientExternalId: string;
  submittedAt: string;
  currency: string;
  lines: PushOrderPayloadLine[];
}

export interface PushResult {
  externalOrderId: string;
  retriable: boolean;
}

export interface ExternalStatusSnapshot {
  externalOrderId: string;
  statusCode: string;
  statusLabel: string;
  occurredAt: string;
}

export interface CatalogDeltaBatch {
  cursor: string;
  items: Array<Record<string, unknown>>;
}

export interface ProviderHealth {
  healthy: boolean;
  message: string;
}

export interface ErpAdapter {
  provider: string;
  pushOrder(payload: PushOrderPayload): Promise<PushResult>;
  fetchOrderStatus(externalOrderId: string): Promise<ExternalStatusSnapshot>;
  pullCatalogChanges(sinceCursor?: string): Promise<CatalogDeltaBatch>;
  health(): Promise<ProviderHealth>;
}
