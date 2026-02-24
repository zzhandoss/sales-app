import { OneCAdapter } from '@integration/erp-1c';
import { createDbFromEnv } from '../db/client';
import { registerErpAdapter } from '../adapters/erp/registry';
import { SyncRetryWorker } from '../adapters/sync/retry-worker';
import { InMemoryCatalogReadPort } from '../infra/query-ports/in-memory-catalog-read.port';
import { DrizzleOrderRepo } from '../infra/repos/drizzle-order.repo';
import { DrizzleOrderStatusEventRepo } from '../infra/repos/drizzle-order-status-event.repo';
import { DrizzleSyncRecordRepo } from '../infra/repos/drizzle-sync-record.repo';
import { AdminAccessService } from '../modules/identity/services/admin-access.service';
import { AccessTokenService } from '../modules/identity/services/access-token.service';
import { IdentityDirectoryService } from '../modules/identity/services/identity-directory.service';
import { CatalogService } from '../modules/catalog/services/catalog.service';
import { OrderStatusEventRepo } from '../modules/orders/repos/order-status-event.repo';
import { OrderAuditLogService } from '../modules/orders/services/order-audit-log.service';
import { LoginUseCase } from '../usecases/identity/login.usecase';
import { CancelOrderUseCase } from '../usecases/orders/cancel-order.usecase';
import { ConfirmFulfillmentUseCase } from '../usecases/orders/confirm-fulfillment.usecase';
import { CreateOrderUseCase } from '../usecases/orders/create-order.usecase';
import { IngestExternalStatusUseCase } from '../usecases/sync/ingest-external-status.usecase';
import { PushOrderToErpUseCase } from '../usecases/sync/push-order-to-erp.usecase';

let adapterRegistered = false;

export interface ApiRuntimeDependencies {
  accessTokenService: AccessTokenService;
  identityDirectoryService: IdentityDirectoryService;
  adminAccessService: AdminAccessService;
  loginUseCase: LoginUseCase;
  catalogService: CatalogService;
  createOrderUseCase: CreateOrderUseCase;
  cancelOrderUseCase: CancelOrderUseCase;
  confirmFulfillmentUseCase: ConfirmFulfillmentUseCase;
  ingestExternalStatusUseCase: IngestExternalStatusUseCase;
  pushOrderToErpUseCase: PushOrderToErpUseCase;
  syncRetryWorker: SyncRetryWorker;
  orderStatusEventRepo: OrderStatusEventRepo;
}

export const createRuntimeDependencies = (): ApiRuntimeDependencies => {
  if (!adapterRegistered) {
    registerErpAdapter(new OneCAdapter());
    adapterRegistered = true;
  }

  const db = createDbFromEnv();
  const orderRepo = new DrizzleOrderRepo(db);
  const orderStatusEventRepo = new DrizzleOrderStatusEventRepo(db);
  const syncRecordRepo = new DrizzleSyncRecordRepo(db);
  const auditLogService = new OrderAuditLogService();
  const identityDirectoryService = new IdentityDirectoryService();
  const adminAccessService = new AdminAccessService();
  const accessTokenService = new AccessTokenService(process.env.AUTH_TOKEN_SECRET ?? 'dev-auth-token-secret');

  const createOrderUseCase = new CreateOrderUseCase(
    orderRepo,
    orderStatusEventRepo,
    syncRecordRepo,
    auditLogService,
  );
  const cancelOrderUseCase = new CancelOrderUseCase(orderRepo, orderStatusEventRepo);
  const confirmFulfillmentUseCase = new ConfirmFulfillmentUseCase(orderRepo, orderStatusEventRepo);
  const ingestExternalStatusUseCase = new IngestExternalStatusUseCase(
    orderRepo,
    orderStatusEventRepo,
    syncRecordRepo,
  );
  const pushOrderToErpUseCase = new PushOrderToErpUseCase(orderRepo, syncRecordRepo);
  const syncRetryWorker = new SyncRetryWorker(syncRecordRepo, pushOrderToErpUseCase);
  const loginUseCase = new LoginUseCase(identityDirectoryService, accessTokenService);
  const catalogService = new CatalogService(new InMemoryCatalogReadPort());

  return {
    accessTokenService,
    identityDirectoryService,
    adminAccessService,
    loginUseCase,
    catalogService,
    createOrderUseCase,
    cancelOrderUseCase,
    confirmFulfillmentUseCase,
    ingestExternalStatusUseCase,
    pushOrderToErpUseCase,
    syncRetryWorker,
    orderStatusEventRepo,
  };
};
