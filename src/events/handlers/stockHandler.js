import eventBus from '../eventBus.js';
import logger from '../../utils/logger.js';
import idempotencyStore from '../../store/idempotencyStore.js';
import cacheStore from '../../store/cacheStore.js';
import orderStore from '../../store/orderStore.js';
import stockService from '../../services/stockService.js';

eventBus.subscribe('payment.success', async ({ orderId, items }) => {
  const idempotencyKey = `payment.success:${orderId}`;

  if (idempotencyStore.seen(idempotencyKey)) {
    logger.info({ message: 'Duplicate event skipped', event: 'payment.success', orderId });
    return;
  }

  idempotencyStore.mark(idempotencyKey);

  try {
    await stockService.validateStock(items);
    eventBus.publish('stock.updated', { orderId });
  } catch (err) {
    logger.error({ message: 'Stock validation failed', orderId, error: err.message });
    orderStore.updateStatus(orderId, 'STOCK_FAILED');
    cacheStore.invalidate(orderId);
    eventBus.publish('stock.failed', { orderId });
  }
});
