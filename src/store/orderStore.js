  /** In-memory order store backed by a Map */
const orders = new Map();

const orderStore = {
  /**
   * Persist a new order object.
   * @param {object} order - The full order object (must have an `id` field)
   */
  create(order) {
    orders.set(order.id, order);
    return order;
  },

  /**
   * Retrieve a single order by ID. Returns undefined if not found.
   * @param {string} id
   */
  get(id) {
    return orders.get(id);
  },

  /**
   * Retrieve every order as an array.
   */
  getAll() {
    return Array.from(orders.values());
  },

  /**
   * Update the status field of an existing order.
   * No-op if the order does not exist.
   * @param {string} id
   * @param {string} status
   */
  updateStatus(id, status) {
    const order = orders.get(id);
    if (order) {
      order.status = status;
      order.updatedAt = new Date().toISOString();
    }
    return order;
  },
};

export default orderStore;
