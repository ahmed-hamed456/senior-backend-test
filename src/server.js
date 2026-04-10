import app from './app.js';
import logger from './utils/logger.js';

// ── Register event handlers (side-effect imports) ────────────────────
// Import order matters: loggerHandler first so it is always first in
// the subscriber list, then the business handlers.
import './events/handlers/loggerHandler.js';
import './events/handlers/paymentHandler.js';
import './events/handlers/stockHandler.js';
import './events/handlers/deliveryHandler.js';

// ── Start HTTP server ─────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info({ message: `Server running on port ${PORT}` });
});
