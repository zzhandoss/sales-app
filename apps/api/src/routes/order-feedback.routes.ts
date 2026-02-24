import { Hono } from 'hono';
import { tenantScopeMiddleware } from './middleware/tenant-scope';

const trustFeedbackStore: Array<{ orderId: string; score: number }> = [];

export const orderFeedbackRoutes = new Hono();
orderFeedbackRoutes.use('*', tenantScopeMiddleware);

orderFeedbackRoutes.post('/api/v1/orders/:orderId/feedback', async (c) => {
  const orderId = c.req.param('orderId');
  const body = await c.req.json();
  trustFeedbackStore.push({ orderId, score: body.score ?? 0 });
  return c.json({ accepted: true });
});
