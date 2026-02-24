import { Hono } from 'hono';
import { requireAuthenticatedUser } from './middleware/auth-context';
import { resolvePermissionGuard } from './middleware/permission-guard';
import { tenantScopeMiddleware } from './middleware/tenant-scope';
import { CancelOrderUseCase } from '../usecases/orders/cancel-order.usecase';
import { UserRole } from '../modules/orders/repos/order.repo';

interface OrderCancelRoutesDependencies {
  cancelOrderUseCase: CancelOrderUseCase;
  permissionGuard: ReturnType<typeof resolvePermissionGuard>;
}

export const createOrderCancelRoutes = ({
  cancelOrderUseCase,
  permissionGuard,
}: OrderCancelRoutesDependencies): Hono => {
  const orderCancelRoutes = new Hono();

  orderCancelRoutes.use('*', requireAuthenticatedUser);
  orderCancelRoutes.use('*', tenantScopeMiddleware);

  orderCancelRoutes.post('/api/v1/orders/:orderId/cancel', permissionGuard('ORDER_CANCEL'), async (c) => {
    const orderId = c.req.param('orderId');
    const tenantId = (c.get as unknown as (key: string) => unknown)('tenantId') as string;
    const role = (c.get as unknown as (key: string) => unknown)('role') as UserRole;
    const result = await cancelOrderUseCase.execute(orderId, tenantId, role);
    return c.json(result);
  });

  return orderCancelRoutes;
};
