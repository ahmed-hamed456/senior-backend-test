import logger from '../utils/logger.js';

/**
 * Global Express error-handling middleware.
 * Must be registered LAST in app.js (4-argument signature is required by Express).
 */
// eslint-disable-next-line no-unused-vars
export default function errorHandler(err, req, res, _next) {
  const status = err.status || err.statusCode || 500;

  logger.error({
    message: 'Unhandled error',
    method: req.method,
    path: req.path,
    error: err.message,
    status,
  });

  res.status(status).json({
    error: true,
    message: err.message || 'Internal Server Error',
    code: status,
  });
}
