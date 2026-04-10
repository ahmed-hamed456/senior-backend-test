import { v4 as uuidv4 } from 'uuid';
import orderStore from '../store/orderStore.js';
import eventBus from '../events/eventBus.js';
import logger from '../utils/logger.js';

const orderService = {
  /**
   * Create a new order, persist it, and emit the "order.created" event.
   * @param {string} customerId
   * @param {Array}  items - [{ productId, quantity }]
   * @returns {object} The created order
   */
  createOrder(customerId, items) {
    const order = {
      id: `ord_${uuidv4()}`,
      customerId,
      items,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    orderStore.create(order);
    logger.info({ message: 'Order created', orderId: order.id, customerId });
    eventBus.publish('order.created', { orderId: order.id, customerId, items });

    return order;
  },
};

export default orderService;
