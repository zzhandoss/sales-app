import { Hono } from 'hono';
import { requireAuthenticatedUser } from './middleware/auth-context';
import { resolvePermissionGuard } from './middleware/permission-guard';
import { tenantScopeMiddleware } from './middleware/tenant-scope';

const trustFeedbackStore: Array<{ orderId: string; score: number; tenantId: string; userId: string }> = [];

interface OrderFeedbackRoutesDependencies {
  permissionGuard: ReturnType<typeof resolvePermissionGuard>;
}

export const createOrderFeedbackRoutes = ({
  permissionGuard,
}: OrderFeedbackRoutesDependencies): Hono => {
  const orderFeedbackRoutes = new Hono();
  orderFeedbackRoutes.use('*', requireAuthenticatedUser);
  orderFeedbackRoutes.use('*', tenantScopeMiddleware);

  orderFeedbackRoutes.post('/api/v1/orders/:orderId/feedback', permissionGuard('ORDER_FEEDBACK_WRITE'), async (c) => {
    const orderId = c.req.param('orderId');
    const tenantId = (c.get as unknown as (key: string) => unknown)('tenantId') as string;
    const userId = (c.get as unknown as (key: string) => unknown)('userId') as string;
    const body = await c.req.json();
    trustFeedbackStore.push({
      orderId,
      tenantId,
      userId,
      score: Number(body.score ?? 0),
    });
    return c.json({ accepted: true });
  });

  return orderFeedbackRoutes;
};
