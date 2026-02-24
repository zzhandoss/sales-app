import { AppError } from '@shared/errors';
import { ErpAdapter } from '@integration/erp-1c';

const adapters = new Map<string, ErpAdapter>();

export const registerErpAdapter = (adapter: ErpAdapter): void => {
  adapters.set(adapter.provider, adapter);
};

export const resolveErpAdapter = (provider: string): ErpAdapter => {
  const adapter = adapters.get(provider);
  if (!adapter) {
    throw new AppError('ERP_ADAPTER_NOT_FOUND', `Adapter not found for provider: ${provider}`, 500);
  }
  return adapter;
};

export const resetErpAdapters = (): void => {
  adapters.clear();
};
