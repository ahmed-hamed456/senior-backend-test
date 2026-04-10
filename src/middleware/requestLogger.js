import logger from '../utils/logger.js';

/**
 * Logs every incoming HTTP request in structured JSON format.
 */
export default function requestLogger(req, _res, next) {
  logger.info({ message: 'Incoming request', method: req.method, path: req.path });
  next();
}
