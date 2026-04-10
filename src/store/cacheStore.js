/** In-memory cache store with TTL support */
const cache = new Map();

const DEFAULT_TTL_MS = 60 * 1000; // 60 seconds

const cacheStore = {
  /**
   * Retrieve a cached value for a key.
   * Returns undefined if the key is missing or has expired.
   * @param {string} key
   */
  get(key) {
    const entry = cache.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      cache.delete(key);
      return undefined;
    }

    return entry.value;
  },

  /**
   * Store a value under a key with an optional TTL.
   * @param {string} key
   * @param {*}      value
   * @param {number} [ttlMs=60000] - Time to live in milliseconds
   */
  set(key, value, ttlMs = DEFAULT_TTL_MS) {
    cache.set(key, { value, expiresAt: Date.now() + ttlMs });
  },

  /**
   * Remove a key from the cache immediately.
   * @param {string} key
   */
  invalidate(key) {
    cache.delete(key);
  },
};

export default cacheStore;
