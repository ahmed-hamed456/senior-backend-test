import eventBus from '../eventBus.js';
import logger from '../../utils/logger.js';

const EVENTS = [
  'order.created',
  'payment.success',
  'payment.failed',
  'stock.updated',
  'stock.failed',
  'delivery.scheduled',
];

EVENTS.forEach((eventName) => {
  eventBus.subscribe(eventName, ({ orderId }) => {
    logger.event(eventName, orderId);
  });
});
