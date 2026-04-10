import eventBus from '../eventBus.js';
import { retry } from '../../utils/retry.js';
import logger from '../../utils/logger.js';
import idempotencyStore from '../../store/idempotencyStore.js';
import cacheStore from '../../store/cacheStore.js';
import orderStore from '../../store/orderStore.js';
import paymentService from '../../services/paymentService.js';

eventBus.subscribe('order.created', async ({ orderId, items }) => {
  const idempotencyKey = `order.created:${orderId}`;

  if (idempotencyStore.seen(idempotencyKey)) {
    logger.info({ message: 'Duplicate event skipped', event: 'order.created', orderId });
    return;
  }

  idempotencyStore.mark(idempotencyKey);

  try {
    await retry(
      () => paymentService.processPayment(orderId),
      3,   // 3 total attempts (= 2 retries)
      300,
      orderId,
    );

    eventBus.publish('payment.success', { orderId, items });
  } catch (err) {
    logger.error({ message: 'Payment failed after all retries', orderId, error: err.message });
    orderStore.updateStatus(orderId, 'PAYMENT_FAILED');
    cacheStore.invalidate(orderId);
    eventBus.publish('payment.failed', { orderId });
  }
});
