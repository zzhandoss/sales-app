import { Hono } from 'hono';
import { requireAuthenticatedUser } from './middleware/auth-context';
import { resolvePermissionGuard } from './middleware/permission-guard';
import { tenantScopeMiddleware } from './middleware/tenant-scope';
import { orderAccessPolicy } from './middleware/order-access';
import { CatalogService } from '../modules/catalog/services/catalog.service';
import { UserRole } from '../modules/orders/repos/order.repo';
import { CreateOrderUseCase } from '../usecases/orders/create-order.usecase';
import { ListOrdersUseCase } from '../usecases/orders/list-orders.usecase';

interface OrderRoutesDependencies {
  createOrderUseCase: CreateOrderUseCase;
  listOrdersUseCase: ListOrdersUseCase;
  catalogService: CatalogService;
  permissionGuard: ReturnType<typeof resolvePermissionGuard>;
}

export const createOrderRoutes = ({
  createOrderUseCase,
  listOrdersUseCase,
  catalogService,
  permissionGuard,
}: OrderRoutesDependencies): Hono => {
  const orderRoutes = new Hono();

  orderRoutes.use('*', requireAuthenticatedUser);
  orderRoutes.use('*', tenantScopeMiddleware);

  orderRoutes.get('/api/v1/catalog/items', permissionGuard('CATALOG_READ'), async (c) => {
    const tenantId = (c.get as unknown as (key: string) => unknown)('tenantId') as string;
    const query = c.req.query('query');
    const items = await catalogService.listCatalog(tenantId, query);
    return c.json({
      items,
      page: 1,
      pageSize: 20,
      total: items.length,
      tenantId,
    });
  });

  orderRoutes.get('/api/v1/orders', permissionGuard('ORDER_READ'), async (c) => {
    const tenantId = (c.get as unknown as (key: string) => unknown)('tenantId') as string;
    const userId = (c.get as unknown as (key: string) => unknown)('userId') as string;
    const role = (c.get as unknown as (key: string) => unknown)('role') as UserRole;
    const orders = await listOrdersUseCase.execute({
      tenantId,
      actorUserId: userId,
      role,
    });
    return c.json({ orders });
  });

  orderRoutes.post('/api/v1/orders', permissionGuard('ORDER_CREATE_SELF'), async (c) => {
    const body = await c.req.json();
    const tenantId = (c.get as unknown as (key: string) => unknown)('tenantId') as string;
    const idempotencyKey = c.req.header('Idempotency-Key') || '';
    const role = (c.get as unknown as (key: string) => unknown)('role') as UserRole;
    const userIdFromContext = (c.get as unknown as (key: string) => unknown)('userId') as string;

    const created = await createOrderUseCase.execute({
      tenantId,
      clientUserId: body.clientUserId,
      createdByUserId: userIdFromContext,
      createdByRole: role,
      idempotencyKey,
      lines: body.lines ?? [],
    });

    return c.json(created, 201);
  });

  orderRoutes.post(
    '/api/v1/orders/assisted',
    permissionGuard('ORDER_CREATE_ASSISTED'),
    orderAccessPolicy,
    async (c) => {
      const body = await c.req.json();
      const tenantId = (c.get as unknown as (key: string) => unknown)('tenantId') as string;
      const idempotencyKey = c.req.header('Idempotency-Key') || `assisted-${Date.now()}`;
      const role = (c.get as unknown as (key: string) => unknown)('role') as UserRole;
      const userIdFromContext = (c.get as unknown as (key: string) => unknown)('userId') as string;

      const created = await createOrderUseCase.execute({
        tenantId,
        clientUserId: body.clientUserId,
        createdByUserId: userIdFromContext,
        createdByRole: role,
        idempotencyKey,
        lines: body.lines ?? [],
      });

      return c.json(created, 201);
    },
  );

  return orderRoutes;
};
