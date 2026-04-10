import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';

const deliveryService = {
  /**
   * Schedule a delivery for the given order.
   * Always succeeds. Returns a delivery ID.
   * @param {string} orderId
   */
  async scheduleDelivery(orderId) {
    const deliveryId = `del_${uuidv4()}`;
    logger.info({ message: 'Delivery scheduled', orderId, deliveryId });
    return { orderId, deliveryId };
  },
};

export default deliveryService;
