import { Hono } from 'hono';
import { requireAuthenticatedUser } from './middleware/auth-context';
import { resolvePermissionGuard } from './middleware/permission-guard';
import { tenantScopeMiddleware } from './middleware/tenant-scope';
import { OrderStatusEventRepo } from '../modules/orders/repos/order-status-event.repo';
import { ConfirmFulfillmentUseCase } from '../usecases/orders/confirm-fulfillment.usecase';

interface OrderStatusRoutesDependencies {
  orderStatusEventRepo: OrderStatusEventRepo;
  confirmFulfillmentUseCase: ConfirmFulfillmentUseCase;
  permissionGuard: ReturnType<typeof resolvePermissionGuard>;
}

export const createOrderStatusRoutes = ({
  orderStatusEventRepo,
  confirmFulfillmentUseCase,
  permissionGuard,
}: OrderStatusRoutesDependencies): Hono => {
  const orderStatusRoutes = new Hono();

  orderStatusRoutes.use('*', requireAuthenticatedUser);
  orderStatusRoutes.use('*', tenantScopeMiddleware);

  orderStatusRoutes.get('/api/v1/orders/:orderId', permissionGuard('ORDER_READ'), async (c) => {
    const orderId = c.req.param('orderId');
    const tenantId = (c.get as unknown as (key: string) => unknown)('tenantId') as string;
    const statusEvents = await orderStatusEventRepo.listByOrder(orderId, tenantId);
    return c.json({ orderId, statusEvents });
  });

  orderStatusRoutes.post(
    '/api/v1/orders/:orderId/confirm-fulfillment',
    permissionGuard('ORDER_CONFIRM_FULFILLMENT'),
    async (c) => {
      const orderId = c.req.param('orderId');
      const tenantId = (c.get as unknown as (key: string) => unknown)('tenantId') as string;
      const userId = (c.get as unknown as (key: string) => unknown)('userId') as string;
      const role = (c.get as unknown as (key: string) => unknown)('role') as string;
      const result = await confirmFulfillmentUseCase.confirm(orderId, tenantId, userId, role);
      return c.json(result);
    },
  );

  return orderStatusRoutes;
};
