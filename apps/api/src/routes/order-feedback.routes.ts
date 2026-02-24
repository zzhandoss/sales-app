import { Hono } from 'hono';
import { roleGuard } from './middleware/role-guard';
import { tenantScopeMiddleware } from './middleware/tenant-scope';

const trustFeedbackStore: Array<{ orderId: string; score: number; tenantId: string; userId: string }> = [];

export const createOrderFeedbackRoutes = (): Hono => {
  const orderFeedbackRoutes = new Hono();
  orderFeedbackRoutes.use('*', tenantScopeMiddleware);

  orderFeedbackRoutes.post('/api/v1/orders/:orderId/feedback', roleGuard(['CLIENT']), async (c) => {
    const orderId = c.req.param('orderId');
    const tenantId = (c.get as unknown as (key: string) => unknown)('tenantId') as string;
    const userId = (c.get as unknown as (key: string) => unknown)('userId') as string | undefined;
    const body = await c.req.json();
    trustFeedbackStore.push({
      orderId,
      tenantId,
      userId: userId ?? 'unknown',
      score: Number(body.score ?? 0),
    });
    return c.json({ accepted: true });
  });

  return orderFeedbackRoutes;
};
