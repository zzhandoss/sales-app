import { Hono } from 'hono';
import { AppError, isAppError } from '@shared/errors';
import { createLogger } from '@shared/logging';
import { securityMiddleware } from './routes/middleware/security';
import { orderRoutes } from './routes/order.routes';
import { orderStatusRoutes } from './routes/order-status.routes';
import { orderCancelRoutes } from './routes/order-cancel.routes';
import { adminRoutes } from './routes/admin.routes';
import { orderFeedbackRoutes } from './routes/order-feedback.routes';

const app = new Hono();
const logger = createLogger({ scope: 'api' });

app.use('*', securityMiddleware);
app.route('/', orderRoutes);
app.route('/', orderStatusRoutes);
app.route('/', orderCancelRoutes);
app.route('/', adminRoutes);
app.route('/', orderFeedbackRoutes);

app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

app.onError((err, c) => {
  logger.error({ err }, 'Unhandled API error');
  if (isAppError(err)) {
    return c.json({ code: err.code, message: err.message, details: err.details }, err.status as 400);
  }
  const fallback = new AppError('INTERNAL_ERROR', 'Internal server error', 500);
  return c.json({ code: fallback.code, message: fallback.message }, fallback.status as 500);
});

export default app;
