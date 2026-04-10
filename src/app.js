import express from 'express';
import requestLogger from './middleware/requestLogger.js';
import errorHandler from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

const app = express();

// ── Body parsing ──────────────────────────────────────────────────────
app.use(express.json());

// ── Request logging ───────────────────────────────────────────────────
app.use(requestLogger);

// ── Routes ────────────────────────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/orders', orderRoutes);

// ── 404 handler ───────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: true, message: 'Route not found', code: 404 });
});

// ── Global error handler (must be last) ───────────────────────────────
app.use(errorHandler);

export default app;
