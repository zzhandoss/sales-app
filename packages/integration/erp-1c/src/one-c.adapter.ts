import {
  CatalogDeltaBatch,
  ErpAdapter,
  ExternalStatusSnapshot,
  ProviderHealth,
  PushOrderPayload,
  PushResult,
} from './erp-adapter';

export class OneCAdapter implements ErpAdapter {
  provider = '1c';

  async pushOrder(payload: PushOrderPayload): Promise<PushResult> {
    return {
      externalOrderId: `1c-${payload.internalOrderId}`,
      retriable: false,
    };
  }

  async fetchOrderStatus(externalOrderId: string): Promise<ExternalStatusSnapshot> {
    return {
      externalOrderId,
      statusCode: 'SYNCED',
      statusLabel: 'Synced',
      occurredAt: new Date().toISOString(),
    };
  }

  async pullCatalogChanges(sinceCursor?: string): Promise<CatalogDeltaBatch> {
    return {
      cursor: sinceCursor ?? new Date().toISOString(),
      items: [],
    };
  }

  async health(): Promise<ProviderHealth> {
    return {
      healthy: true,
      message: '1C adapter is reachable',
    };
  }
}
