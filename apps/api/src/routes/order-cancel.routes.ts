import { Hono } from 'hono';
import { tenantScopeMiddleware } from './middleware/tenant-scope';
import { roleGuard } from './middleware/role-guard';
import { CancelOrderUseCase } from '../usecases/orders/cancel-order.usecase';
import { UserRole } from '../modules/orders/repos/order.repo';

interface OrderCancelRoutesDependencies {
  cancelOrderUseCase: CancelOrderUseCase;
}

export const createOrderCancelRoutes = ({
  cancelOrderUseCase,
}: OrderCancelRoutesDependencies): Hono => {
  const orderCancelRoutes = new Hono();

  orderCancelRoutes.use('*', tenantScopeMiddleware);

  orderCancelRoutes.post(
    '/api/v1/orders/:orderId/cancel',
    roleGuard(['CLIENT', 'SALES_AGENT', 'IN_STORE_MANAGER']),
    async (c) => {
      const orderId = c.req.param('orderId');
      const tenantId = (c.get as unknown as (key: string) => unknown)('tenantId') as string;
      const role = (c.get as unknown as (key: string) => unknown)('role') as UserRole;
      const result = await cancelOrderUseCase.execute(orderId, tenantId, role);
      return c.json(result);
    },
  );

  return orderCancelRoutes;
};
