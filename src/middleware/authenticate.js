import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/index.js';
import logger from '../utils/logger.js';

/**
 * Verifies a Bearer JWT in the Authorization header.
 * Attaches the decoded payload to req.user on success.
 * Returns 401 on missing or invalid token.
 */
export default function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: true, message: 'Missing or malformed Authorization header', code: 401 });
  }

  const token = authHeader.slice(7); // strip "Bearer "

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    logger.error({ message: 'JWT verification failed', error: err.message });
    return res.status(401).json({ error: true, message: 'Invalid or expired token', code: 401 });
  }
}
