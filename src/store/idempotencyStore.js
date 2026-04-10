/**
 * In-memory idempotency store.
 * Tracks processed event keys to prevent duplicate handling.
 * Key format: "<eventName>:<orderId>"
 */
const processed = new Set();

const idempotencyStore = {
  /**
   * Check whether this event+order combination has already been processed.
   * @param {string} key - e.g. "payment.success:ord_123"
   */
  seen(key) {
    return processed.has(key);
  },

  /**
   * Mark an event+order combination as processed.
   * @param {string} key
   */
  mark(key) {
    processed.add(key);
  },
};

export default idempotencyStore;
