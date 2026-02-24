import { OneCAdapter } from '@integration/erp-1c';
import { createDbFromEnv } from '../db/client';
import { registerErpAdapter } from '../adapters/erp/registry';
import { SyncRetryWorker } from '../adapters/sync/retry-worker';
import { InMemoryCatalogReadPort } from '../infra/query-ports/in-memory-catalog-read.port';
import { DrizzleIdentityUserRepo } from '../infra/repos/drizzle-identity-user.repo';
import { DrizzleOrderRepo } from '../infra/repos/drizzle-order.repo';
import { DrizzleOrderStatusEventRepo } from '../infra/repos/drizzle-order-status-event.repo';
import { DrizzleSyncRecordRepo } from '../infra/repos/drizzle-sync-record.repo';
import { AccessPolicyService } from '../modules/identity/services/access-policy.service';
import { AccessTokenService } from '../modules/identity/services/access-token.service';
import { AdminAccessService } from '../modules/identity/services/admin-access.service';
import { IdentityDirectoryService } from '../modules/identity/services/identity-directory.service';
import { PasswordHashService } from '../modules/identity/services/password-hash.service';
import { CatalogService } from '../modules/catalog/services/catalog.service';
import { OrderStatusEventRepo } from '../modules/orders/repos/order-status-event.repo';
import { OrderAuditLogService } from '../modules/orders/services/order-audit-log.service';
import { LoginUseCase } from '../usecases/identity/login.usecase';
import { CancelOrderUseCase } from '../usecases/orders/cancel-order.usecase';
import { ConfirmFulfillmentUseCase } from '../usecases/orders/confirm-fulfillment.usecase';
import { CreateOrderUseCase } from '../usecases/orders/create-order.usecase';
import { ListOrdersUseCase } from '../usecases/orders/list-orders.usecase';
import { IngestExternalStatusUseCase } from '../usecases/sync/ingest-external-status.usecase';
import { ListDeadLetterUseCase } from '../usecases/sync/list-dead-letter.usecase';
import { PushOrderToErpUseCase } from '../usecases/sync/push-order-to-erp.usecase';
import { RetryDeadLetterUseCase } from '../usecases/sync/retry-dead-letter.usecase';
import { resolvePermissionGuard } from '../routes/middleware/permission-guard';

let adapterRegistered = false;

export interface ApiRuntimeDependencies {
  accessTokenService: AccessTokenService;
  identityDirectoryService: IdentityDirectoryService;
  adminAccessService: AdminAccessService;
  permissionGuard: ReturnType<typeof resolvePermissionGuard>;
  loginUseCase: LoginUseCase;
  catalogService: CatalogService;
  createOrderUseCase: CreateOrderUseCase;
  listOrdersUseCase: ListOrdersUseCase;
  cancelOrderUseCase: CancelOrderUseCase;
  confirmFulfillmentUseCase: ConfirmFulfillmentUseCase;
  ingestExternalStatusUseCase: IngestExternalStatusUseCase;
  pushOrderToErpUseCase: PushOrderToErpUseCase;
  listDeadLetterUseCase: ListDeadLetterUseCase;
  retryDeadLetterUseCase: RetryDeadLetterUseCase;
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
  const identityUserRepo = new DrizzleIdentityUserRepo(db);
  const auditLogService = new OrderAuditLogService();
  const passwordHashService = new PasswordHashService();
  const identityDirectoryService = new IdentityDirectoryService(identityUserRepo, passwordHashService);
  const adminAccessService = new AdminAccessService();
  const accessPolicyService = new AccessPolicyService();
  const permissionGuard = resolvePermissionGuard({ accessPolicyService });
  const accessTokenService = new AccessTokenService(process.env.AUTH_TOKEN_SECRET ?? 'dev-auth-token-secret');

  const createOrderUseCase = new CreateOrderUseCase(
    orderRepo,
    orderStatusEventRepo,
    syncRecordRepo,
    auditLogService,
  );
  const listOrdersUseCase = new ListOrdersUseCase(orderRepo);
  const cancelOrderUseCase = new CancelOrderUseCase(orderRepo, orderStatusEventRepo);
  const confirmFulfillmentUseCase = new ConfirmFulfillmentUseCase(orderRepo, orderStatusEventRepo);
  const ingestExternalStatusUseCase = new IngestExternalStatusUseCase(
    orderRepo,
    orderStatusEventRepo,
    syncRecordRepo,
  );
  const pushOrderToErpUseCase = new PushOrderToErpUseCase(orderRepo, syncRecordRepo);
  const listDeadLetterUseCase = new ListDeadLetterUseCase(syncRecordRepo);
  const retryDeadLetterUseCase = new RetryDeadLetterUseCase(syncRecordRepo);
  const syncRetryWorker = new SyncRetryWorker(syncRecordRepo, pushOrderToErpUseCase);
  const loginUseCase = new LoginUseCase(identityDirectoryService, accessTokenService);
  const catalogService = new CatalogService(new InMemoryCatalogReadPort());

  return {
    accessTokenService,
    identityDirectoryService,
    adminAccessService,
    permissionGuard,
    loginUseCase,
    catalogService,
    createOrderUseCase,
    listOrdersUseCase,
    cancelOrderUseCase,
    confirmFulfillmentUseCase,
    ingestExternalStatusUseCase,
    pushOrderToErpUseCase,
    listDeadLetterUseCase,
    retryDeadLetterUseCase,
    syncRetryWorker,
    orderStatusEventRepo,
  };
};
