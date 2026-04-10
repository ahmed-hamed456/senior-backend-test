import logger from '../utils/logger.js';

const paymentService = {
  /**
   * Simulate a payment attempt for the given order.
   * Resolves on success, throws on failure so retry logic can kick in.
   * Success rate: ~70%
   * @param {string} orderId
   */
  async processPayment(orderId) {
    const success = Math.random() > 0.3;

    if (success) {
      logger.info({ message: 'Payment processed successfully', orderId });
      return { orderId, status: 'SUCCESS' };
    }

    throw new Error(`Payment declined for order ${orderId}`);
  },
};

export default paymentService;
