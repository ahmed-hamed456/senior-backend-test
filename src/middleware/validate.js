/**
 * Validates the body of POST /orders requests.
 * Returns 400 with a descriptive message on any validation failure.
 */
export default function validate(req, res, next) {
  const { customerId, items } = req.body;

  if (!customerId || typeof customerId !== 'string' || customerId.trim() === '') {
    return res.status(400).json({ error: true, message: 'customerId must be a non-empty string', code: 400 });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: true, message: 'items must be a non-empty array', code: 400 });
  }

  for (const [index, item] of items.entries()) {
    if (!item.productId || typeof item.productId !== 'string' || item.productId.trim() === '') {
      return res.status(400).json({
        error: true,
        message: `items[${index}].productId must be a non-empty string`,
        code: 400,
      });
    }

    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      return res.status(400).json({
        error: true,
        message: `items[${index}].quantity must be a positive integer`,
        code: 400,
      });
    }
  }

  next();
}
