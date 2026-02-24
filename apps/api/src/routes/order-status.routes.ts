import { Hono } from 'hono';
import { roleGuard } from './middleware/role-guard';
import { tenantScopeMiddleware } from './middleware/tenant-scope';
import { OrderStatusEventRepo } from '../modules/orders/repos/order-status-event.repo';
import { ConfirmFulfillmentUseCase } from '../usecases/orders/confirm-fulfillment.usecase';

interface OrderStatusRoutesDependencies {
  orderStatusEventRepo: OrderStatusEventRepo;
  confirmFulfillmentUseCase: ConfirmFulfillmentUseCase;
}

export const createOrderStatusRoutes = ({
  orderStatusEventRepo,
  confirmFulfillmentUseCase,
}: OrderStatusRoutesDependencies): Hono => {
  const orderStatusRoutes = new Hono();

  orderStatusRoutes.use('*', tenantScopeMiddleware);

  orderStatusRoutes.get(
    '/api/v1/orders/:orderId',
    roleGuard(['CLIENT', 'SALES_AGENT', 'IN_STORE_MANAGER', 'ADMIN']),
    async (c) => {
      const orderId = c.req.param('orderId');
      const tenantId = (c.get as unknown as (key: string) => unknown)('tenantId') as string;
      const statusEvents = await orderStatusEventRepo.listByOrder(orderId, tenantId);
      return c.json({ orderId, statusEvents });
    },
  );

  orderStatusRoutes.post('/api/v1/orders/:orderId/confirm-fulfillment', roleGuard(['CLIENT']), async (c) => {
    const orderId = c.req.param('orderId');
    const tenantId = (c.get as unknown as (key: string) => unknown)('tenantId') as string;
    const userId = c.req.header('x-user-id') || 'unknown-user';
    const role = (c.get as unknown as (key: string) => unknown)('role') as string;
    const result = await confirmFulfillmentUseCase.confirm(orderId, tenantId, userId, role);
    return c.json(result);
  });

  return orderStatusRoutes;
};
