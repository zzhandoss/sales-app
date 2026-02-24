import { Hono } from 'hono';
import { AppError, isAppError } from '@shared/errors';
import { createLogger } from '@shared/logging';
import { createAdminRoutes } from './routes/admin.routes';
import { createAuthRoutes } from './routes/auth.routes';
import { createOrderCancelRoutes } from './routes/order-cancel.routes';
import { createOrderFeedbackRoutes } from './routes/order-feedback.routes';
import { createOrderRoutes } from './routes/order.routes';
import { createOrderStatusRoutes } from './routes/order-status.routes';
import { resolveAuthContext } from './routes/middleware/auth-context';
import { securityMiddleware } from './routes/middleware/security';
import { createRuntimeDependencies } from './runtime/dependencies';
import { createWebRoutes } from './routes/web.routes';

const app = new Hono();
const logger = createLogger({ scope: 'api' });
const dependencies = createRuntimeDependencies();

app.use('*', securityMiddleware);
app.use('/api/v1/*', resolveAuthContext({ accessTokenService: dependencies.accessTokenService }));

app.route(
  '/',
  createAuthRoutes({
    loginUseCase: dependencies.loginUseCase,
    identityDirectoryService: dependencies.identityDirectoryService,
  }),
);
app.route('/', createOrderRoutes({ createOrderUseCase: dependencies.createOrderUseCase, catalogService: dependencies.catalogService }));
app.route(
  '/',
  createOrderStatusRoutes({
    orderStatusEventRepo: dependencies.orderStatusEventRepo,
    confirmFulfillmentUseCase: dependencies.confirmFulfillmentUseCase,
  }),
);
app.route('/', createOrderCancelRoutes({ cancelOrderUseCase: dependencies.cancelOrderUseCase }));
app.route(
  '/',
  createAdminRoutes({
    identityDirectoryService: dependencies.identityDirectoryService,
    adminAccessService: dependencies.adminAccessService,
  }),
);
app.route('/', createOrderFeedbackRoutes());
app.route('/', createWebRoutes());

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
