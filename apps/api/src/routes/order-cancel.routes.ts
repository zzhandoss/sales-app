import { Hono } from 'hono';
import { tenantScopeMiddleware } from './middleware/tenant-scope';
import { roleGuard } from './middleware/role-guard';
import { CancelOrderUseCase } from '../usecases/orders/cancel-order.usecase';

const cancelOrderUseCase = new CancelOrderUseCase();

export const orderCancelRoutes = new Hono();

orderCancelRoutes.use('*', tenantScopeMiddleware);

orderCancelRoutes.post('/api/v1/orders/:orderId/cancel', roleGuard(['CLIENT', 'SALES_AGENT', 'IN_STORE_MANAGER']), (c) => {
  const orderId = c.req.param('orderId');
  const state = c.req.header('x-order-state') || 'SUBMITTED';
  const result = cancelOrderUseCase.execute(orderId, state);
  return c.json(result);
});
