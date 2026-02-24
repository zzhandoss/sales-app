import { Hono } from 'hono';
import { roleGuard } from './middleware/role-guard';
import { tenantScopeMiddleware } from './middleware/tenant-scope';
import { orderAccessPolicy } from './middleware/order-access';
import { UserRole } from '../modules/orders/repos/order.repo';
import { CreateOrderUseCase } from '../usecases/orders/create-order.usecase';

interface OrderRoutesDependencies {
  createOrderUseCase: CreateOrderUseCase;
}

export const createOrderRoutes = ({ createOrderUseCase }: OrderRoutesDependencies): Hono => {
  const orderRoutes = new Hono();

  orderRoutes.use('*', tenantScopeMiddleware);

  orderRoutes.get(
    '/api/v1/catalog/items',
    roleGuard(['CLIENT', 'SALES_AGENT', 'IN_STORE_MANAGER', 'ADMIN']),
    (c) => {
      const tenantId = (c.get as unknown as (key: string) => unknown)('tenantId') as string;
      return c.json({
        items: [],
        page: 1,
        pageSize: 20,
        total: 0,
        tenantId,
      });
    },
  );

  orderRoutes.post('/api/v1/orders', roleGuard(['CLIENT', 'SALES_AGENT', 'IN_STORE_MANAGER']), async (c) => {
    const body = await c.req.json();
    const tenantId = (c.get as unknown as (key: string) => unknown)('tenantId') as string;
    const idempotencyKey = c.req.header('Idempotency-Key') || '';
    const role = (c.get as unknown as (key: string) => unknown)('role') as UserRole;
    const userId = c.req.header('x-user-id') ?? body.clientUserId;

    const created = await createOrderUseCase.execute({
      tenantId,
      clientUserId: body.clientUserId,
      createdByUserId: userId,
      createdByRole: role,
      idempotencyKey,
      lines: body.lines ?? [],
    });

    return c.json(created, 201);
  });

  orderRoutes.post(
    '/api/v1/orders/assisted',
    roleGuard(['SALES_AGENT', 'IN_STORE_MANAGER']),
    orderAccessPolicy,
    async (c) => {
      const body = await c.req.json();
      const tenantId = (c.get as unknown as (key: string) => unknown)('tenantId') as string;
      const idempotencyKey = c.req.header('Idempotency-Key') || `assisted-${Date.now()}`;
      const role = (c.get as unknown as (key: string) => unknown)('role') as UserRole;
      const userId = c.req.header('x-user-id') ?? body.createdByUserId;

      const created = await createOrderUseCase.execute({
        tenantId,
        clientUserId: body.clientUserId,
        createdByUserId: userId,
        createdByRole: role,
        idempotencyKey,
        lines: body.lines ?? [],
      });

      return c.json(created, 201);
    },
  );

  return orderRoutes;
};
