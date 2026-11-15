import { Router } from 'express';
import { login, me } from '../controllers/auth.controller.js';
import * as services from '../controllers/service.controller.js';
import * as orders from '../controllers/order.controller.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth admin
apiRouter.post('/auth/login', login);
apiRouter.get('/auth/me', requireAuth, me);

// Publik
apiRouter.get('/services', services.listPublic);
apiRouter.get('/services/:slug', services.detailPublic);
apiRouter.post('/orders', orders.create);
apiRouter.get('/orders/track/:code', orders.track);

// Khusus admin
const admin = Router();
admin.use(requireAuth, requireAdmin);

admin.get('/stats', orders.stats);
admin.get('/orders', orders.list);
admin.get('/orders/:id', orders.detail);
admin.patch('/orders/:id', orders.update);

admin.get('/services', services.listAdmin);
admin.post('/services', services.create);
admin.put('/services/:id', services.update);
admin.delete('/services/:id', services.remove);

apiRouter.use('/admin', admin);
