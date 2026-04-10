import logger from '../utils/logger.js';

const stockService = {
  /**
   * Simulate stock validation for a set of order items.
   * Resolves on success, throws on failure.
   * Success rate: ~80%
   * @param {Array} items - Array of { productId, quantity }
   */
  async validateStock(items) {
    const success = Math.random() > 0.2;

    if (success) {
      logger.info({ message: 'Stock validated successfully', items });
      return { status: 'OK' };
    }

    throw new Error('Insufficient stock for one or more items');
  },
};

export default stockService;
