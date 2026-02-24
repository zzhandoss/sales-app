import { Hono } from 'hono';
import { roleGuard } from './middleware/role-guard';
import { tenantScopeMiddleware } from './middleware/tenant-scope';
import { OrderStatusEventRepo } from '../modules/orders/repos/order-status-event.repo';
import { ConfirmFulfillmentUseCase } from '../usecases/orders/confirm-fulfillment.usecase';

const statusRepo = new OrderStatusEventRepo();
const confirmUseCase = new ConfirmFulfillmentUseCase(statusRepo);

export const orderStatusRoutes = new Hono();

orderStatusRoutes.use('*', tenantScopeMiddleware);

orderStatusRoutes.get('/api/v1/orders/:orderId', roleGuard(['CLIENT', 'SALES_AGENT', 'IN_STORE_MANAGER', 'ADMIN']), (c) => {
  const orderId = c.req.param('orderId');
  const statusEvents = statusRepo.listByOrder(orderId);
  return c.json({ orderId, statusEvents });
});

orderStatusRoutes.post('/api/v1/orders/:orderId/confirm-fulfillment', roleGuard(['CLIENT']), (c) => {
  const orderId = c.req.param('orderId');
  const userId = c.req.header('x-user-id') || 'unknown-user';
  const role = (c.get as unknown as (key: string) => unknown)('role') as string;
  const result = confirmUseCase.confirm(orderId, userId, role);
  return c.json(result);
});
