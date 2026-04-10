import logger from './logger.js';

/**
 * Retries an async function up to `attempts` times with a delay between each.
 * Throws the last error if all attempts are exhausted.
 *
 * @param {Function} fn       - Async function to retry (should throw on failure)
 * @param {number}   attempts - Total number of attempts (1 = no retry)
 * @param {number}   delayMs  - Milliseconds to wait between retries
 * @param {string}   context  - Label used in retry logs (e.g. orderId)
 */
export async function retry(fn, attempts = 3, delayMs = 200, context = '') {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      logger.error({
        message: `Attempt ${attempt}/${attempts} failed`,
        context,
        error: err.message,
      });

      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError;
}
