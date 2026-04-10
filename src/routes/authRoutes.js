import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { USERS, JWT_SECRET, JWT_EXPIRES_IN } from '../config/index.js';
import logger from '../utils/logger.js';

const router = Router();

/**
 * POST /auth/login
 * Body: { username, password }
 * Returns a signed JWT containing { id, role, brandId }
 */
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: true, message: 'username and password are required', code: 400 });
  }

  const user = USERS.find((u) => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ error: true, message: 'Invalid credentials', code: 401 });
  }

  const payload = { id: user.id, role: user.role, brandId: user.brandId };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  logger.info({ message: 'User logged in', userId: user.id, role: user.role });

  return res.status(200).json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

export default router;
