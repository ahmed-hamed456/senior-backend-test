import eventBus from '../eventBus.js';
import logger from '../../utils/logger.js';
import idempotencyStore from '../../store/idempotencyStore.js';
import cacheStore from '../../store/cacheStore.js';
import orderStore from '../../store/orderStore.js';
import deliveryService from '../../services/deliveryService.js';

eventBus.subscribe('stock.updated', async ({ orderId }) => {
  const idempotencyKey = `stock.updated:${orderId}`;

  if (idempotencyStore.seen(idempotencyKey)) {
    logger.info({ message: 'Duplicate event skipped', event: 'stock.updated', orderId });
    return;
  }

  idempotencyStore.mark(idempotencyKey);

  try {
    const { deliveryId } = await deliveryService.scheduleDelivery(orderId);
    orderStore.updateStatus(orderId, 'COMPLETED');
    cacheStore.invalidate(orderId);
    eventBus.publish('delivery.scheduled', { orderId, deliveryId });
    logger.info({ message: 'Order completed', orderId, deliveryId });
  } catch (err) {
    logger.error({ message: 'Delivery scheduling failed', orderId, error: err.message });
  }
});
