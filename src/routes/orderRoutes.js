import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import validate from '../middleware/validate.js';
import orderService from '../services/orderService.js';
import orderStore from '../store/orderStore.js';
import cacheStore from '../store/cacheStore.js';
import logger from '../utils/logger.js';
import { CACHE_TTL_MS } from '../config/index.js';

const router = Router();

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/**
 * Check whether the authenticated user may access the given order.
 * Returns true if access is allowed, false otherwise.
 *
 * admin   → unrestricted
 * customer→ only their own orders (order.customerId === user.id)
 * brand   → only orders that contain at least one product whose
 *            productId starts with the user's brandId
 */
function canAccess(user, order) {
  if (user.role === 'admin') return true;

  if (user.role === 'customer') {
    return order.customerId === user.id;
  }

  if (user.role === 'brand') {
    return order.items.some((item) => item.productId.startsWith(user.brandId));
  }

  return false;
}

/* ------------------------------------------------------------------ */
/* POST /orders — customer only                                        */
/* ------------------------------------------------------------------ */
router.post('/', authenticate, authorize('customer'), validate, (req, res, next) => {
  try {
    const { customerId, items } = req.body;
    const order = orderService.createOrder(customerId, items);
    return res.status(201).json({ success: true, order });
  } catch (err) {
    next(err);
  }
});

/* ------------------------------------------------------------------ */
/* GET /orders — admin sees all; brand sees their own                  */
/* ------------------------------------------------------------------ */
router.get('/', authenticate, authorize('admin', 'brand'), (req, res, next) => {
  try {
    const allOrders = orderStore.getAll();
    const filtered = allOrders.filter((order) => canAccess(req.user, order));
    return res.status(200).json({ success: true, count: filtered.length, orders: filtered });
  } catch (err) {
    next(err);
  }
});

/* ------------------------------------------------------------------ */
/* GET /orders/:id — admin / brand / customer with ownership check     */
/* ------------------------------------------------------------------ */
router.get('/:id', authenticate, authorize('admin', 'brand', 'customer'), (req, res, next) => {
  try {
    const { id } = req.params;

    // --- cache lookup ---
    const cached = cacheStore.get(id);
    if (cached) {
      logger.info({ message: 'Cache hit', orderId: id });
      // Still enforce ownership on cached results
      if (!canAccess(req.user, cached)) {
        return res.status(403).json({ error: true, message: 'Forbidden: you do not own this order', code: 403 });
      }
      return res.status(200).json({ success: true, cached: true, order: cached });
    }

    logger.info({ message: 'Cache miss', orderId: id });

    // --- memory store lookup ---
    const order = orderStore.get(id);

    if (!order) {
      return res.status(404).json({ error: true, message: `Order ${id} not found`, code: 404 });
    }

    // Ownership check
    if (!canAccess(req.user, order)) {
      return res.status(403).json({ error: true, message: 'Forbidden: you do not own this order', code: 403 });
    }

    // Populate cache
    cacheStore.set(id, order, CACHE_TTL_MS);

    return res.status(200).json({ success: true, cached: false, order });
  } catch (err) {
    next(err);
  }
});

export default router;
